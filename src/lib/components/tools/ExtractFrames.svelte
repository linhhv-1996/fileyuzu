<script lang="ts">
    import { tick } from 'svelte';
    import JSZip from 'jszip';
    import { formatSize } from '$lib/utils';
    import { getVideoInfo, extractSingleFrame, extractFramesBulk } from '$lib/utils/ffmpeg-frames';
    
    interface Props {
        texts?: any;
        inputFormats?: string;
        sampleVideoPath?: string;
    }
    
    let { 
        texts = {}, 
        inputFormats = 'video/*', 
        sampleVideoPath = '/file_sample_1280x720.mp4' 
    }: Props = $props();
    
    let status = $state<'idle' | 'file' | 'proc'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let videoUrl = $state<string | null>(null);
    let isDragging = $state(false);
    let isLoadingSample = $state(false);
    
    let extractedFrames = $state<{url: string, filename: string}[]>([]);
    
    let mode = $state<'current' | 'interval' | 'evenly'>('current');
    
    let intervalValue = $state(10);
    let framesValue = $state(10);
    
    let progress = $state(0);
    let extractError = $state<string | null>(null);
    let videoRef = $state<HTMLVideoElement | undefined>();
    let resultsRef = $state<HTMLElement | undefined>();
    
    // Thumbnail & Timeline states
    let thumbnails = $state<string[]>([]);
    let videoDuration = $state(0);
    let currentTime = $state(0);
    let generatedThumbs = $state(false);
    let isGeneratingThumbs = $state(false);
    let isVideoUnsupported = $state(false);

    function formatTime(seconds: number) {
        if (isNaN(seconds) || !seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    async function setFile(file: File) {
        selectedFile = file;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        videoUrl = URL.createObjectURL(file);
        
        status = 'file';
        thumbnails = [];
        extractedFrames.forEach(f => URL.revokeObjectURL(f.url));
        extractedFrames = [];
        generatedThumbs = false;
        isVideoUnsupported = false;
        
        generateThumbnailsFromVideo(videoUrl);
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            setFile(target.files[0]);
        }
    }
    
    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
    }
    
    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
    }
    
    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('video/')) {
                setFile(file);
            } else {
                alert('Please drop a video file.');
            }
        }
    }
    
    function removeFile() {
        selectedFile = null;
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            videoUrl = null;
        }
        thumbnails = [];
        extractedFrames.forEach(f => URL.revokeObjectURL(f.url));
        extractedFrames = [];
        generatedThumbs = false;
        isVideoUnsupported = false;
        if (fileInput) fileInput.value = '';
        status = 'idle';
    }

    function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    async function generateThumbnailsFromVideo(url: string) {
        if (generatedThumbs || !url) return;
        generatedThumbs = true;
        isGeneratingThumbs = true;
        
        const hiddenVideo = document.createElement('video');
        hiddenVideo.src = url;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        hiddenVideo.preload = 'metadata';
        
        try {
            await new Promise((resolve, reject) => {
                hiddenVideo.onloadedmetadata = resolve;
                hiddenVideo.onerror = reject;
                setTimeout(() => reject(new Error('timeout')), 15_000);
            });
            
            if (!hiddenVideo.duration || isNaN(hiddenVideo.duration)) {
                isGeneratingThumbs = false;
                return;
            }
            videoDuration = hiddenVideo.duration;

            // More thumbnails = denser, more accurate strip
            // Cap based on duration: short clips get denser coverage
            const THUMB_COUNT = videoDuration < 30 ? 20 : videoDuration < 120 ? 40 : 30;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { isGeneratingThumbs = false; return; }
            
            // Smaller canvas = faster, still plenty for a 60–80px tall strip
            canvas.width = 120;
            canvas.height = 68;

            const step = videoDuration / THUMB_COUNT;
            const thumbs: string[] = [];
            
            for (let i = 0; i < THUMB_COUNT; i++) {
                const time = Math.min(i * step, videoDuration - 0.05);
                
                await new Promise<void>((resolve) => {
                    if (Math.abs(hiddenVideo.currentTime - time) < 0.05) {
                        resolve();
                        return;
                    }
                    const onSeeked = () => {
                        hiddenVideo.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    hiddenVideo.addEventListener('seeked', onSeeked);
                    hiddenVideo.currentTime = time;
                });
                
                ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
                thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
                
                // Progressive update every 5 frames so strip fills in visually
                if (i % 5 === 4 || i === THUMB_COUNT - 1) {
                    thumbnails = [...thumbs];
                }
            }
            
            thumbnails = thumbs;
        } catch (e) {
            console.warn('Canvas thumbnail generation failed (format not supported natively).', e);
            isVideoUnsupported = true;
            if (mode === 'current') {
                mode = 'interval';
            }
            if (selectedFile) {
                try {
                    const info = await getVideoInfo(selectedFile);
                    videoDuration = info.duration;
                } catch (err) {
                    console.error("Failed to get duration via FFmpeg", err);
                }
            }
        } finally {
            isGeneratingThumbs = false;
        }
    }

    async function handleExtractCurrent() {
        if (!selectedFile) return;
        status = 'proc';
        progress = 0;
        extractError = null;
        
        try {
            // Give UI a moment to update
            await new Promise(r => setTimeout(r, 100));
            
            // If they scrubbed exactly to the end, step slightly back to ensure FFmpeg finds a frame
            let safeTimestamp = currentTime;
            if (videoDuration > 0 && safeTimestamp >= videoDuration - 0.1) {
                safeTimestamp = Math.max(0, videoDuration - 0.1);
            }
            
            let blob: Blob;
            
            // Try Lightning-Fast Native Canvas Extraction First
            if (videoRef && videoRef.videoWidth > 0 && videoRef.videoHeight > 0) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.videoWidth;
                canvas.height = videoRef.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
                    blob = await new Promise<Blob>((resolve, reject) => {
                        canvas.toBlob((b) => {
                            if (b) resolve(b);
                            else reject(new Error('Canvas toBlob failed'));
                        }, 'image/jpeg', 1.0);
                    });
                } else {
                    blob = await extractSingleFrame(selectedFile, safeTimestamp, 'image/jpeg');
                }
            } else {
                // Fallback to FFmpeg (for unplayable formats like MKV)
                blob = await extractSingleFrame(selectedFile, safeTimestamp, 'image/jpeg');
            }
            
            const ext = 'jpg';
            const basename = selectedFile.name.split('.').slice(0, -1).join('.') || 'video';
            const filename = `${basename}_frame_${Math.floor(currentTime)}s.${ext}`;
            
            const frameUrl = URL.createObjectURL(blob);
            extractedFrames = [...extractedFrames, { url: frameUrl, filename }];
            
            status = 'file';
            tick().then(() => resultsRef?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        } catch (e: any) {
            console.error('Extraction failed', e);
            extractError = e?.message || 'Failed to extract frame. Please try again.';
            status = 'file';
        }
    }

    async function handleExtractBulk() {
        if (!selectedFile) return;
        if (mode === 'current') return;
        status = 'proc';
        progress = 0;
        extractError = null;
        
        try {
            let actualDuration = videoDuration;
            if (!actualDuration || isNaN(actualDuration)) {
                const info = await getVideoInfo(selectedFile);
                actualDuration = info.duration;
            }
            
            const val = mode === 'interval' ? intervalValue : framesValue;
            const extracted = await extractFramesBulk(selectedFile, mode, val, actualDuration, 'image/jpeg', (p) => {
                progress = p;
            });
            
            for (const f of extracted) {
                const frameUrl = URL.createObjectURL(f.blob);
                extractedFrames.push({ url: frameUrl, filename: f.name });
            }
            extractedFrames = [...extractedFrames];
            
            progress = 100;
            status = 'file';
            tick().then(() => resultsRef?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        } catch (e: any) {
            console.error('Bulk extraction failed', e);
            extractError = e?.message || 'Failed to extract frames. Please try again.';
            status = 'file';
        }
    }

    async function downloadAll() {
        const zip = new JSZip();
        const basename = selectedFile?.name?.split('.').slice(0, -1).join('.') || 'video';
        for (const frame of extractedFrames) {
            try {
                const res = await fetch(frame.url);
                const blob = await res.blob();
                zip.file(frame.filename, blob);
            } catch (e) {
                console.warn('Failed to fetch frame for zip', e);
            }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${basename}_frames.zip`);
    }

    function reset() {
        extractError = null;
        removeFile();
    }
    
    // Sync slider to video
    function onSliderChange(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        currentTime = val;
        if (videoRef) {
            videoRef.currentTime = val;
        }
    }
</script>

<div class="card">
    <div class="tool-body">

        {#if status === 'idle'}
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || 'Upload Video'}</p>
                <p class="sub">{texts.uploadSubtitle || 'MP4, MOV, etc.'}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || 'Select File'}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch(sampleVideoPath)
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], sampleVideoPath.split('/').pop() || 'sample.mp4', { type: "video/mp4" }));
                            })
                            .catch(() => {
                                setFile(new File(["sample content"], sampleVideoPath.split('/').pop() || 'sample.mp4', { type: "video/mp4" }));
                            })
                            .finally(() => {
                                isLoadingSample = false;
                            });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || 'Sample'}
                        {:else}
                            <i class="ti ti-player-play" aria-hidden="true"></i> {texts.btnSample || 'Sample'}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint || ''}</p>
                <p class="hint hint-mobile">{texts.hint || ''}</p>
            </div>
            
            <div class="settings">
                <button class="btn-cta" disabled><i class="ti ti-camera" aria-hidden="true"></i> {texts?.btn?.extract || 'Extract'}</button>
            </div>
        {/if}

        {#if status === 'file' || status === 'proc'}
            <div style="height: auto; padding-bottom: 6px; display: flex; flex-direction: column; gap: 8px;">
                <div class="preview-main" style="flex: none; height: {isVideoUnsupported ? 'auto' : '350px'}; overflow: hidden; position: relative; border-radius: 8px; background: {isVideoUnsupported ? 'var(--bg-color)' : '#000'}; border: {isVideoUnsupported ? '1px dashed var(--border-color)' : 'none'}; padding: {isVideoUnsupported ? '40px 20px' : '0'}; display: flex; align-items: center; justify-content: center; text-align: center;">
                    {#if isVideoUnsupported}
                        <div style="color: var(--text-color, #64748b);">
                            <i class="ti ti-video-off" style="font-size: 32px; margin-bottom: 12px; display: block; opacity: 0.6;" aria-hidden="true"></i>
                            <p style="margin: 0 0 8px 0; font-weight: 500;">{texts?.preview?.not_available || 'Preview Not Available'}</p>
                            <p style="margin: 0; font-size: 14px; opacity: 0.8;">{texts?.preview?.unsupported_format ? texts.preview.unsupported_format.replace('{filename}', selectedFile?.name) : `The browser doesn't support previewing this format (${selectedFile?.name})`}.<br/>{texts?.preview?.fallback_hint || 'You can still use Interval or Evenly modes to extract frames.'}</p>
                        </div>
                    {:else if videoUrl}
                        <!-- svelte-ignore a11y_media_has_caption -->
                        <video 
                            bind:this={videoRef}
                            src={videoUrl} 
                            style="width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0;border-radius:inherit;" 
                            controls
                            onpause={() => currentTime = videoRef?.currentTime || 0}
                            onseeked={() => currentTime = videoRef?.currentTime || 0}
                            ontimeupdate={() => currentTime = videoRef?.currentTime || 0}
                        ></video>
                    {/if}
                    {#if status === 'file'}
                        <button class="btn-rm" aria-label="Remove file" onclick={removeFile} style="z-index: 10;"><i class="ti ti-x" aria-hidden="true"></i></button>
                    {/if}
                </div>
                
                <!-- Thumbnail Timeline Strip -->
                {#if thumbnails.length > 0 || isGeneratingThumbs}
                <div class="timeline-wrapper" style="position: relative; width: 100%;">
                    <div class="thumb-strip-container" style="position: relative; width: 100%; height: 50px; background: #111827; border-radius: 6px; overflow: hidden; display: flex;">
                        {#if isGeneratingThumbs && thumbnails.length === 0}
                            <div class="thumb-skeleton" aria-hidden="true"></div>
                        {:else}
                            {#each thumbnails as thumb}
                                <img src={thumb} style="height: 100%; flex: 1; min-width: 0; object-fit: cover; display: block;" alt="" draggable="false"/>
                            {/each}
                        {/if}
                        
                        {#if status === 'file'}
                            <input 
                                type="range" 
                                min="0" 
                                max={videoDuration} 
                                step="0.033" 
                                value={currentTime}
                                oninput={onSliderChange}
                                class="thumb-slider" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; z-index: 5;" 
                            />
                        {/if}
                        
                        <div class="strip-overlay strip-overlay-left" style="width: {videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%;"></div>
                        <div class="strip-overlay strip-overlay-right" style="left: {videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%;"></div>
                        
                        <div class="thumb-cursor" style="left: {videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%;">
                            <div class="cursor-line"></div>
                            <div class="cursor-handle"></div>
                        </div>
                    </div>
                    <div class="timeline-footer">
                        <span>0:00</span>
                        <span style="font-weight: 600; color: var(--tx, #0f172a);">{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
                        <span>{formatTime(videoDuration)}</span>
                    </div>
                </div>
                {/if}
            </div>
        {/if}

        {#if extractError}
            <div class="error-banner" role="alert">
                <i class="ti ti-alert-triangle" aria-hidden="true" style="flex-shrink:0;"></i>
                <span>{extractError}</span>
                <button class="error-dismiss" onclick={() => extractError = null} aria-label="Dismiss error">
                    <i class="ti ti-x" aria-hidden="true"></i>
                </button>
            </div>
        {/if}

        {#if status === 'file' || status === 'proc'}
            <div class="settings">
                <div class="setting-row format-row" style="margin-bottom: 0;">
                    <div class="setting-ctl" style="width: 100%;">
                        <div class="format-tags">
                            {#if !isVideoUnsupported}
                                <span class="tag" class:on={mode === 'current'} role="button" tabindex="0" onclick={() => mode = 'current'} onkeydown={(e) => e.key==='Enter' && (mode='current')}>
                                    {texts?.mode?.current || 'Current'}
                                </span>
                            {/if}
                            <span class="tag" class:on={mode === 'interval'} role="button" tabindex="0" onclick={() => mode = 'interval'} onkeydown={(e) => e.key==='Enter' && (mode='interval')}>
                                {texts?.mode?.interval || 'Interval'}
                            </span>
                            <span class="tag" class:on={mode === 'evenly'} role="button" tabindex="0" onclick={() => mode = 'evenly'} onkeydown={(e) => e.key==='Enter' && (mode='evenly')}>
                                {texts?.mode?.evenly || 'Evenly'}
                            </span>
                        </div>
                    </div>
                </div>

                {#if mode === 'interval'}
                    <div class="setting-row top">
                        <div class="setting-lbl">{texts?.settings?.interval || 'Interval'}</div>
                        <div class="setting-ctl">
                            <div class="size-row">
                                <div class="size-input-line">
                                    <input class="size-input" type="number" min="0.1" step="0.1" bind:value={intervalValue} aria-label="Interval seconds" />
                                </div>
                            </div>
                        </div>
                    </div>
                {:else if mode === 'evenly'}
                    <div class="setting-row top">
                        <div class="setting-lbl">{texts?.settings?.frames || 'Number of frames'}</div>
                        <div class="setting-ctl">
                            <div class="size-row">
                                <div class="size-input-line">
                                    <input class="size-input" type="number" min="2" step="1" bind:value={framesValue} aria-label="Number of frames" />
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}

                <hr class="settings-divider">

                {#if status === 'proc'}
                    <button class="btn-cta processing" disabled style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;">
                        <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                        <span class="cta-desktop">{progress}% — {texts?.proc?.extracting || 'Extracting frames...'}</span>
                        <span class="cta-mobile" style="display:none">{progress}% — {texts?.proc?.extracting || 'Extracting frames...'}</span>
                    </button>
                {:else}
                    <button class="btn-cta" onclick={mode === 'current' ? handleExtractCurrent : handleExtractBulk}>
                        <i class="ti ti-camera" aria-hidden="true"></i>
                        <span class="cta-desktop">{mode === 'current' ? (texts?.btn?.save_current || 'Extract Frame') : (texts?.btn?.extract_zip || 'Extract Bulk')}</span>
                        <span class="cta-mobile" style="display:none">{mode === 'current' ? (texts?.btn?.save_current || 'Extract Frame') : (texts?.btn?.extract_zip || 'Extract Bulk')}</span>
                    </button>
                {/if}
            </div>
        {/if}

        {#if extractedFrames.length > 0}
            <div class="extracted-frames-container" bind:this={resultsRef}>
                <div class="extracted-header">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color, #0f172a);">{texts?.results?.extracted_frames || 'Extracted Frames'} ({extractedFrames.length})</h3>
                    <div class="header-actions">
                        {#if extractedFrames.length > 1}
                            <button class="btn-primary btn-sm" onclick={downloadAll}>
                                <i class="ti ti-download" aria-hidden="true"></i> {texts?.btn?.download_all || 'Download All'}
                            </button>
                        {/if}
                        <button class="btn-default btn-sm" onclick={() => {
                            extractedFrames.forEach(f => URL.revokeObjectURL(f.url));
                            extractedFrames = [];
                        }}>{texts?.btn?.clear_all || 'Clear All'}</button>
                    </div>
                </div>
                <div class="frames-grid-wrapper">
                    <div class="frames-grid" class:single={extractedFrames.length === 1}>
                        {#each extractedFrames as frame}
                            <div class="frame-item">
                                <img src={frame.url} alt={frame.filename} />
                                <div class="frame-overlay">
                                    <a href={frame.url} download={frame.filename} class="btn-download-icon" aria-label="Download">
                                        <i class="ti ti-download" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}

    </div>
</div>

<input type="file" bind:this={fileInput} accept={inputFormats} style="display:none" onchange={handleFileChange}>

<style>
    
    /* Responsiveness */
    @media (max-width: 600px) {
        .extracted-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
        }
        .header-actions {
            width: 100%;
            justify-content: stretch;
        }
        .header-actions button {
            flex: 1;
            justify-content: center;
        }
        .frames-grid {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
        }
        .preview-main {
            height: 200px !important;
        }
    }

    .extracted-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    .header-actions {
        display: flex;
        gap: 8px;
    }
    .extracted-frames-container {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color, #e2e8f0);
    }
    .frames-grid-wrapper {
        max-height: 450px;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .frames-grid-wrapper::-webkit-scrollbar {
        display: none;
    }
    .frames-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
    .frames-grid.single {
        grid-template-columns: 1fr;
    }
    .frame-item {
        position: relative;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-color, #fff);
    }
    .frame-item img {
        width: 100%;
        height: auto;
        display: block;
    }
    .frame-overlay {
        position: absolute;
        bottom: 8px;
        right: 8px;
        display: flex;
    }
    .btn-download-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.7);
        color: white;
        text-decoration: none;
        transition: background 0.2s;
        backdrop-filter: blur(4px);
    }
    .btn-download-icon:hover {
        background: rgba(15, 23, 42, 0.9);
    }
    .btn-sm {
        padding: 6px 14px !important;
        font-size: 13px !important;
        border-radius: 6px !important;
        min-height: 0 !important;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .error-banner {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
    }
    :global([data-theme='dark']) .error-banner {
        background: rgba(185, 28, 28, 0.15);
        border-color: rgba(185, 28, 28, 0.4);
        color: #fca5a5;
    }
    .error-dismiss {
        margin-left: auto;
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        padding: 0;
        line-height: 1;
        opacity: 0.7;
    }
    .error-dismiss:hover { opacity: 1; }
    .thumb-skeleton {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            90deg,
            #1f2937 25%,
            #374151 50%,
            #1f2937 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* ── Timeline Cursor ── */
    .thumb-cursor {
        position: absolute;
        top: 0;
        height: 100%;
        z-index: 4;
        pointer-events: none;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .cursor-line {
        width: 3px;
        height: 100%;
        background: #fff;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.9);
        border-radius: 1.5px;
    }
    .cursor-handle {
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%);
        width: 14px;
        height: 14px;
        background: #fff;
        border: 2.5px solid #4a90d9;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 8px rgba(74,144,217,0.8);
    }

    /* ── Dark overlays flanking the cursor ── */
    .strip-overlay {
        position: absolute;
        top: 0;
        height: 100%;
        z-index: 2;
        pointer-events: none;
    }
    .strip-overlay-left {
        left: 0;
        background: rgba(0, 0, 0, 0.4);
    }
    .strip-overlay-right {
        right: 0;
        background: rgba(0, 0, 0, 0.4);
    }

    /* ── Timeline Footer ── */
    .timeline-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        font-family: monospace;
        font-size: 11px;
        color: var(--tx-sub, #94a3b8);
        padding: 0 2px;
    }

    .format-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    @media (max-width: 768px) {
        .format-row {
            align-items: flex-start !important;
        }
    }
</style>
