<script lang="ts">
    import { formatSize } from '$lib/utils';
    import { convertVideoFile } from '$lib/utils/video-converter';
    
    interface Props {
        texts?: any;
        inputFormats?: string;
        outputFormats?: string[];
        sampleVideoPath?: string;
    }
    
    let { 
        texts = {}, 
        inputFormats = 'video/*', 
        outputFormats = ['mp4', 'webm', 'mov', 'mkv', 'mp3'],
        sampleVideoPath = '/file_sample_1280x720.mp4' 
    }: Props = $props();
    
    let status = $state<'idle' | 'file' | 'proc' | 'done'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let targetFormat = $state(outputFormats[0] || 'mp4');
    let videoUrl = $state<string | null>(null);
    let isDragging = $state(false);
    
    let progress = $state(0);
    let convertedSize = $state(0);
    let convertedFile = $state<File | null>(null);
    
    function setFile(file: File) {
        selectedFile = file;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        videoUrl = URL.createObjectURL(file);
        status = 'file';
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
        convertedFile = null;
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            videoUrl = null;
        }
        if (fileInput) fileInput.value = '';
        status = 'idle';
    }
    
    async function startConversion() {
        if (!selectedFile) return;
        status = 'proc';
        progress = 0;
        convertedFile = null;
        
        try {
            const resultFile = await convertVideoFile(selectedFile, targetFormat, (p) => {
                progress = p;
            });
            
            progress = 100;
            convertedSize = resultFile.size;
            convertedFile = resultFile;
            
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            videoUrl = URL.createObjectURL(resultFile);
            
            status = 'done';
        } catch (err) {
            console.error('Conversion error:', err);
            status = 'file';
        }
    }
    
    function reset() {
        removeFile();
    }
    
    function getFileExtension(filename: string) {
        return filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    }
</script>

<div class="card">
    <div class="tool-body">

        {#if status === 'idle'}
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle}</p>
                <p class="sub">{texts.uploadSubtitle}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect}
                    </button>
                    <button class="btn-default" onclick={(e) => { e.stopPropagation();
                        fetch(sampleVideoPath)
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found, using mock.');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], sampleVideoPath.split('/').pop() || 'sample.mp4', { type: "video/mp4" }));
                            })
                            .catch(() => {
                                setFile(new File(["sample content"], sampleVideoPath.split('/').pop() || 'sample.mp4', { type: "video/mp4" }));
                            });
                    }}>
                        <i class="ti ti-player-play" aria-hidden="true"></i> {texts.btnSample}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint}</p>
                <p class="hint hint-mobile">{texts.hint}</p>
            </div>
            
            <div class="settings">
                <div class="setting-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                    <div class="setting-lbl" style="margin-bottom: 0; white-space: nowrap;">{texts.formatLbl}</div>
                    {#each outputFormats as fmt}
                        <span class="tag" class:on={targetFormat === fmt} role="button" tabindex="0" onclick={() => targetFormat = fmt} onkeydown={(e) => e.key==='Enter' && (targetFormat=fmt)}>
                            {fmt.toUpperCase()}
                        </span>
                    {/each}
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled><i class="ti ti-arrows-right-left" aria-hidden="true"></i> {texts.btnConvert}</button>
            </div>
        {/if}

        {#if status !== 'idle'}
            <div class={status === 'done' ? "done-frame" : "preview-frame"}>
                <div class="preview-main" style="overflow: hidden; position: relative;">
                    {#if videoUrl && !(status === 'done' && targetFormat === 'mp3')}
                        <video src={videoUrl} style="width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0;border-radius:inherit;background:#000;" controls></video>
                    {:else if videoUrl && status === 'done' && targetFormat === 'mp3'}
                        <div style="width:100%; height:100%; background: linear-gradient(135deg, #1e293b, #0f172a); display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 24px; position:absolute; top:0; left:0;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
                                <i class="ti ti-music" aria-hidden="true" style="font-size:36px; color: #38bdf8;"></i>
                            </div>
                            <audio src={videoUrl} style="width:85%; max-width: 320px; outline: none; border-radius: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" controls></audio>
                        </div>
                    {:else}
                        <div class="preview-ph" style={status === 'done' ? "opacity:.25;color:#fff" : ""}><i class="ti ti-player-play" aria-hidden="true"></i><span>{status === 'done' ? '' : selectedFile?.name}</span></div>
                    {/if}
                    {#if status === 'file'}
                        <button class="btn-rm" aria-label="Remove file" onclick={removeFile}><i class="ti ti-x" aria-hidden="true"></i></button>
                    {/if}
                </div>
            </div>
            
            <div class="vid-info">
                <div class="fn">{status === 'done' ? convertedFile?.name : selectedFile?.name}</div>
                <div class="fm">
                    {#if status === 'done'}
                        <span style="color:var(--green);font-weight:600">{targetFormat.toUpperCase()}</span> · <span style="font-weight:600">{formatSize(convertedSize)}</span>
                    {:else}
                        {getFileExtension(selectedFile?.name || '')} · {formatSize(selectedFile?.size || 0)}
                    {/if}
                </div>
            </div>
        {/if}

        {#if status === 'file'}
            <div class="settings">
                <div class="setting-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                    <div class="setting-lbl" style="margin-bottom: 0; white-space: nowrap;">{texts.formatLbl}</div>
                    {#each outputFormats as fmt}
                        <span class="tag" class:on={targetFormat === fmt} role="button" tabindex="0" onclick={() => targetFormat = fmt} onkeydown={(e) => e.key==='Enter' && (targetFormat=fmt)}>
                            {fmt.toUpperCase()}
                        </span>
                    {/each}
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" onclick={startConversion}>
                    <i class="ti ti-arrows-right-left" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnConvert}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnConvert}</span>
                </button>
            </div>
        {/if}

        {#if status === 'proc'}
            <div class="settings">
                <div class="setting-row" style="opacity:.4;pointer-events:none; display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
                    <div class="setting-lbl" style="margin-bottom: 0; white-space: nowrap;">{texts.formatLbl}</div>
                    {#each outputFormats as fmt}
                        <span class="tag" class:on={targetFormat === fmt}>{fmt.toUpperCase()}</span>
                    {/each}
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled>
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progress}% — {texts.procConverting}</span>
                    <span class="cta-mobile" style="display:none">{progress}% — {texts.procConverting}</span>
                </button>
                <div class="prog-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    <div class="prog-fill" style="width: {progress}%"></div>
                </div>
            </div>
        {/if}

        {#if status === 'done'}
            <hr class="settings-divider">
            <div class="done-cta">
                <button class="btn-dl" onclick={() => {
                    if (convertedFile && videoUrl) {
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = convertedFile.name;
                        a.click();
                    }
                }}>
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnDownload}</span>
                </button>
                <button class="btn-default" style="width:100%;justify-content:center" onclick={reset}>
                    <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnConvertNew}
                </button>
            </div>
        {/if}

    </div>
</div>

<input type="file" bind:this={fileInput} accept={inputFormats} style="display:none" onchange={handleFileChange}>

<style>
    /* CSS is handled globally in app.css */
</style>
