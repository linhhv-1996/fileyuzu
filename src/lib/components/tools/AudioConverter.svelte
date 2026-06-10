<script lang="ts">
    import { formatSize } from '$lib/utils';
    import { convertAudioFile } from '$lib/utils/audio-converter';
    import { slide, fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import JSZip from 'jszip';
    
    interface Props {
        texts?: any;
        inputFormats?: string;
        outputFormats?: string[];
        sampleAudioPath?: string;
    }
    
    let { 
        texts = {}, 
        inputFormats = 'audio/*,.mp3,.wav,.m4a,.flac,.ogg,.aac,.wma', 
        outputFormats = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'wma'],
        sampleAudioPath = '/sample_audio.wav' // assuming a sample file exists or we mock it
    }: Props = $props();

    type FileItem = {
        id: string;
        file: File;
        status: 'pending' | 'processing' | 'done' | 'error';
        progress: number;
        convertedFile: File | null;
        objectUrl: string | null;
        audioRef?: HTMLAudioElement;
        audioPaused?: boolean;
        audioTime?: number;
        audioDuration?: number;

        originalUrl: string | null;
        origAudioRef?: HTMLAudioElement;
        origPaused?: boolean;
        origTime?: number;
        origDuration?: number;
    };
    
    let items = $state<FileItem[]>([]);
    let fileInput = $state<HTMLInputElement | undefined>();
    // svelte-ignore state_referenced_locally
    let targetFormat = $state(outputFormats[0] || 'mp3');
    let isDragging = $state(false);
    let isLoadingSample = $state(false);
    
    let isConverting = $derived(items.some(i => i.status === 'processing'));
    let hasFiles = $derived(items.length > 0);
    let allDone = $derived(items.length > 0 && items.every(i => i.status === 'done' || i.status === 'error'));
    
    function formatTime(seconds: number) {
        if (isNaN(seconds) || !seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function addFiles(newFiles: FileList | File[]) {
        const newItems: FileItem[] = Array.from(newFiles).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            status: 'pending',
            progress: 0,
            convertedFile: null,
            objectUrl: null,
            audioPaused: true,
            audioTime: 0,
            audioDuration: 0,
            
            originalUrl: URL.createObjectURL(file),
            origPaused: true,
            origTime: 0,
            origDuration: 0
        }));
        items = [...items, ...newItems];
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            addFiles(target.files);
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
            addFiles(e.dataTransfer.files);
        }
    }
    
    function removeItem(id: string) {
        const item = items.find(i => i.id === id);
        if (item?.objectUrl) {
            URL.revokeObjectURL(item.objectUrl);
        }
        if (item?.originalUrl) {
            URL.revokeObjectURL(item.originalUrl);
        }
        items = items.filter(i => i.id !== id);
        if (items.length === 0 && fileInput) fileInput.value = '';
    }
    
    async function startConversion() {
        if (isConverting || !hasFiles) return;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].status === 'pending' || items[i].status === 'error') {
                items[i].status = 'processing';
                items[i].progress = 0;
                
                try {
                    const resultFile = await convertAudioFile(items[i].file, targetFormat, (p) => {
                        items[i].progress = p;
                    });
                    
                    items[i].progress = 100;
                    items[i].convertedFile = resultFile;
                    items[i].objectUrl = URL.createObjectURL(resultFile);
                    items[i].status = 'done';
                } catch (err) {
                    console.error('Conversion error for', items[i].file.name, err);
                    items[i].status = 'error';
                }
            }
        }
    }
    
    function reset() {
        items.forEach(item => {
            if (item.objectUrl) URL.revokeObjectURL(item.objectUrl);
            if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        });
        items = [];
        if (fileInput) fileInput.value = '';
    }
    
    function getFileExtension(filename: string) {
        return filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    }
    
    async function downloadAllAsZip() {
        const zip = new JSZip();
        const doneItems = items.filter(i => i.status === 'done' && i.convertedFile);
        if (doneItems.length === 0) return;
        
        doneItems.forEach(item => {
            zip.file(item.convertedFile!.name, item.convertedFile!);
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `converted_audio_${Date.now()}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    }
</script>

<div class="card">
    <div class="tool-body">

        {#if !hasFiles}
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || 'Upload Audio Files'}</p>
                <p class="sub">{texts.uploadSubtitle || 'Drag & drop multiple audio files'}</p>
                <div class="btn-row">
                    <button class="btn-primary btn-download-all" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || 'Select Files'}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch(sampleAudioPath)
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found, using mock.');
                                return res.blob();
                            })
                            .then(blob => {
                                addFiles([new File([blob], sampleAudioPath.split('/').pop() || 'sample.mp3', { type: "audio/mpeg" })]);
                            })
                            .catch(() => {
                                addFiles([new File(["sample content"], sampleAudioPath.split('/').pop() || 'sample.mp3', { type: "audio/mpeg" })]);
                            })
                            .finally(() => {
                                isLoadingSample = false;
                            });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || 'Try Sample'}
                        {:else}
                            <i class="ti ti-music" aria-hidden="true"></i> {texts.btnSample || 'Try Sample'}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint || 'Supports MP3, WAV, FLAC, M4A, OGG...'}</p>
                <p class="hint hint-mobile">{texts.hint || 'Supports multiple formats'}</p>
            </div>
            
            <div class="settings">
                <div class="setting-row format-row" class:single-option={outputFormats.length === 1}>
                    <div class="setting-lbl" style="margin-bottom: 0; white-space: nowrap;">{texts.formatLbl || 'Target Format'}</div>
                    <div class="format-tags">
                        {#each outputFormats as fmt}
                            <span class="tag" class:on={targetFormat === fmt} role="button" tabindex="0" onclick={() => targetFormat = fmt} onkeydown={(e) => e.key==='Enter' && (targetFormat=fmt)}>
                                {fmt.toUpperCase()}
                            </span>
                        {/each}
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled><i class="ti ti-arrows-right-left" aria-hidden="true"></i> {texts.btnConvert || 'Convert Files'}</button>
            </div>
        {/if}

        {#if hasFiles}
            <div class="file-list">
                {#each items as item (item.id)}
                    <div class="file-item" transition:slide|local animate:flip={{duration: 250}}>
                        <div class="file-info-group">
                            <div class="file-icon" style={item.status !== 'done' && item.originalUrl ? "padding:0; background:transparent;" : ""}>
                                {#if item.status !== 'done' && item.originalUrl}
                                    <audio 
                                        src={item.originalUrl} 
                                        bind:this={item.origAudioRef}
                                        bind:paused={item.origPaused}
                                        bind:currentTime={item.origTime}
                                        bind:duration={item.origDuration}
                                        onended={() => item.origPaused = true}
                                        style="display:none"
                                    ></audio>
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button class="audio-play-btn" style="width:100%;height:100%;border-radius:10px;margin:0;" onclick={() => item.origPaused ? item.origAudioRef?.play() : item.origAudioRef?.pause()}>
                                        <i class="ti {item.origPaused ? 'ti-player-play' : 'ti-player-pause'}" aria-hidden="true" style="font-size:20px;"></i>
                                    </button>
                                {:else}
                                    <div style="width:100%;height:100%;border-radius:10px;background:rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;">
                                        <i class="ti ti-music" aria-hidden="true" style="font-size:20px;color:var(--primary);"></i>
                                    </div>
                                {/if}
                            </div>
                            <div class="file-details">
                                <div class="fn" title={item.file.name}>{item.file.name}</div>
                                <div class="fm">
                                    {#if item.status === 'done'}
                                        <span style="color:var(--green);font-weight:600">{targetFormat.toUpperCase()}</span> · <span style="font-weight:600">{formatSize(item.convertedFile?.size || 0)}</span>
                                    {:else if item.status === 'error'}
                                        <span style="color:var(--red);font-weight:600">Error</span>
                                    {:else}
                                        {getFileExtension(item.file.name)} · {formatSize(item.file.size)}
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <div class="file-actions">
                            {#if item.status === 'processing'}
                                <!-- <div class="progress-bar-container" in:fade={{duration: 200}}>
                                    <div class="progress-bar" style="width: {item.progress}%"></div>
                                    <span class="progress-text">{item.progress}%</span>
                                </div> -->
                            {:else if item.status === 'done' && item.objectUrl}
                                <div class="audio-player-mini" in:fade={{duration: 200, delay: 200}}>
                                    <audio 
                                        src={item.objectUrl} 
                                        bind:this={item.audioRef}
                                        bind:paused={item.audioPaused}
                                        bind:currentTime={item.audioTime}
                                        bind:duration={item.audioDuration}
                                        onended={() => item.audioPaused = true}
                                        style="display:none"
                                    ></audio>
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button class="audio-play-btn" onclick={() => item.audioPaused ? item.audioRef?.play() : item.audioRef?.pause()}>
                                        <i class="ti {item.audioPaused ? 'ti-player-play' : 'ti-player-pause'}" aria-hidden="true"></i>
                                    </button>
                                </div>
                                <button class="btn-icon" aria-label="Download" onclick={() => {
                                    if (item.convertedFile && item.objectUrl) {
                                        const a = document.createElement('a');
                                        a.href = item.objectUrl;
                                        a.download = item.convertedFile.name;
                                        a.click();
                                    }
                                }} in:fade={{duration: 200, delay: 200}}>
                                    <i class="ti ti-download" aria-hidden="true"></i>
                                </button>
                            {/if}

                            {#if !isConverting && item.status !== 'done'}
                                <button class="btn-icon text-muted" aria-label="Remove" onclick={() => removeItem(item.id)} in:fade={{duration: 200}}>
                                    <i class="ti ti-x" aria-hidden="true"></i>
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

            {#if !isConverting && !allDone}
                <button class="add-more-btn" style="margin-bottom: 24px;" onclick={() => fileInput?.click()}>
                    <i class="ti ti-plus" aria-hidden="true"></i> {texts.btnAddMore || 'Add more files'}
                </button>
            {/if}

            <div class="settings">
                {#if !allDone}
                    <div class="setting-row format-row" class:single-option={outputFormats.length === 1} style={isConverting ? "opacity:.4;pointer-events:none;" : ""}>
                        <div class="setting-lbl" style="margin-bottom: 0; white-space: nowrap;">{texts.formatLbl || 'Target Format'}</div>
                        <div class="format-tags">
                            {#each outputFormats as fmt}
                                <span class="tag" class:on={targetFormat === fmt} role="button" tabindex="0" onclick={() => targetFormat = fmt} onkeydown={(e) => e.key==='Enter' && (targetFormat=fmt)}>
                                    {fmt.toUpperCase()}
                                </span>
                            {/each}
                        </div>
                    </div>
                    <hr class="settings-divider">
                {/if}
                
                {#if isConverting}
                    <button class="btn-cta processing-btn" disabled>
                        <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                        <span class="cta-desktop">{texts.procConverting || 'Converting...'}</span>
                        <span class="cta-mobile" style="display:none">{texts.procConverting || 'Converting...'}</span>
                    </button>
                {:else if !allDone}
                    <button class="btn-cta" onclick={startConversion}>
                        <i class="ti ti-arrows-right-left" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts.btnConvert || 'Convert All'}</span>
                        <span class="cta-mobile" style="display:none">{texts.btnConvert || 'Convert'}</span>
                    </button>
                {:else}
                    <div class="done-cta" style="margin-top: 0; display:flex; flex-direction:column; gap:12px;">
                        {#if items.filter(i => i.status === 'done').length > 1}
                            <button class="btn-primary" style="width:100%;justify-content:center" onclick={downloadAllAsZip}>
                                <i class="ti ti-archive" aria-hidden="true"></i> {texts.btnDownloadAll || 'Download All (ZIP)'}
                            </button>
                        {/if}
                        <button class="btn-default" style="width:100%;justify-content:center" onclick={reset}>
                            <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnConvertNew || 'Convert New Files'}
                        </button>
                    </div>
                {/if}
            </div>
        {/if}

    </div>
</div>

<input type="file" bind:this={fileInput} accept={inputFormats} multiple style="display:none" onchange={handleFileChange}>

<style>
    .format-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }
    @media (max-width: 768px) {
        .format-row {
            align-items: flex-start !important;
        }
        .format-row.single-option {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start;
            gap: 12px;
        }
    }

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 24px;
        max-height: 360px;
        overflow-y: auto;
        padding-right: 4px;
    }
    .file-list::-webkit-scrollbar {
        width: 6px;
    }
    .file-list::-webkit-scrollbar-track {
        background: transparent;
    }
    .file-list::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
    }
    :global(body.dark) .file-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
    }
    
    .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        gap: 16px;
    }
    :global(body.dark) .file-item {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.05);
    }
    
    .file-info-group {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 1;
        min-width: 0;
    }
    
    .file-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary, #3b82f6);
        font-size: 20px;
        flex-shrink: 0;
    }
    :global(body.dark) .file-icon {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .file-details {
        flex: 1;
        min-width: 0;
    }
    
    .fn {
        font-weight: 500;
        color: var(--text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        margin-bottom: 2px;
    }
    
    .fm {
        font-size: 12px;
        color: var(--text-muted);
    }
    
    .file-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        transition: all 0.3s ease;
    }
    
    .btn-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: transparent;
        border: none;
        color: var(--text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 18px;
    }
    .btn-icon:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    :global(body.dark) .btn-icon:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .btn-icon.text-muted {
        color: var(--text-muted);
    }
    .btn-icon.text-muted:hover {
        color: var(--red);
    }

    .btn-download-all{
        padding: 8px 16px;
    }

    .settings{
        padding-top: 10px;
    }

    .audio-player-mini {
        display: flex;
        align-items: center;
    }
    .audio-play-btn {
        width: 36px; height: 36px; border-radius: 8px; background: rgba(var(--primary-rgb, 59, 130, 246), 0.1); color: var(--primary, #3b82f6); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;
    }
    .audio-play-btn:hover {
        background: rgba(var(--primary-rgb, 59, 130, 246), 0.2);
    }
    
    .add-more-btn {
        width: 100%;
        padding: 12px;
        border: 2px dashed rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        background: transparent;
        color: var(--text-muted);
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
    }
    .add-more-btn:hover {
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
        background: rgba(var(--primary-rgb, 59, 130, 246), 0.05);
    }
    :global(body.dark) .add-more-btn {
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .processing-btn {
        background: rgba(0,0,0,0.05) !important;
        color: var(--text-color) !important;
        border: none !important;
    }
    :global(body.dark) .processing-btn {
        background: rgba(255,255,255,0.1) !important;
    }

    .upload-box{
        min-height: 250px;
    }

    @media (max-width: 600px) {
        .file-item {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
        }
        .file-actions {
            justify-content: flex-end;
        }
    }
</style>
