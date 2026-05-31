<script lang="ts">
    import { formatSize } from '$lib/utils';
    
    let { texts = {} }: { texts?: any } = $props();
    
    let status = $state<'idle' | 'file' | 'proc' | 'done'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let autoOptimize = $state(true);
    let targetSize = $state('');
    let videoUrl = $state<string | null>(null);
    let isDragging = $state(false);
    
    // mock processing
    let progress = $state(0);
    let compressedSize = $state(0);
    
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
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            videoUrl = null;
        }
        if (fileInput) fileInput.value = '';
        status = 'idle';
    }
    
    function startCompression() {
        if (!selectedFile) return;
        status = 'proc';
        progress = 0;
        
        // Mock progress
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    compressedSize = selectedFile!.size * 0.15; // mock 85% compression
                    status = 'done';
                }, 500);
            }
        }, 300);
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
                        // Mock sample
                        fetch('/file_sample_1280x720.mp4')
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found, using mock.');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], "file_sample_1280x720.mp4", { type: "video/mp4" }));
                            })
                            .catch(() => {
                                setFile(new File(["sample content"], "file_sample_1280x720.mp4", { type: "video/mp4" }));
                            });
                    }}>
                        <i class="ti ti-player-play" aria-hidden="true"></i> {texts.btnSample}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint}</p>
                <p class="hint hint-mobile">{texts.hint}</p>
            </div>
            
            <div class="settings">
                <div class="setting-row">
                    <div class="setting-lbl">{texts.autoOptimizeLbl}</div>
                    <div class="setting-ctl">
                        <button class="toggle" class:on={autoOptimize} onclick={() => autoOptimize = !autoOptimize} aria-label={texts.autoOptimizeLbl}></button>
                    </div>
                </div>
                <div class="setting-row top target-size-row" style={autoOptimize ? 'opacity:.4;pointer-events:none' : ''}>
                    <div class="setting-lbl" style="padding-top:9px">{texts.sizeLbl}</div>
                    <div class="setting-ctl">
                        <div class="size-row">
                            <div class="size-input-line">
                                <input class="size-input" type="number" placeholder="e.g. 25" min="1" bind:value={targetSize} tabindex={autoOptimize ? -1 : 0}>
                                <span class="unit">MB</span>
                            </div>
                        </div>
                    </div>
                    <div class="tag-row target-tags-full">
                        <span class="tag" class:on={targetSize === '25'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '25'} onkeydown={(e) => e.key==='Enter' && (targetSize='25')}>Gmail/25MB</span>
                        <span class="tag" class:on={targetSize === '8'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '8'} onkeydown={(e) => e.key==='Enter' && (targetSize='8')}>Discord/8MB</span>
                        <span class="tag" class:on={targetSize === '50'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '50'} onkeydown={(e) => e.key==='Enter' && (targetSize='50')}>Line/50MB</span>
                        <span class="tag" class:on={targetSize === '100'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '100'} onkeydown={(e) => e.key==='Enter' && (targetSize='100')}>Slack/100MB</span>
                        <span class="tag" class:on={targetSize === '200'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '200'} onkeydown={(e) => e.key==='Enter' && (targetSize='200')}>WhatsApp/200MB</span>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled><i class="ti ti-bolt" aria-hidden="true"></i> {texts.btnCompress}</button>
            </div>
        {/if}

        {#if status === 'file'}
            <div class="preview-frame">
                <div class="preview-main" style="overflow: hidden; position: relative;">
                    {#if videoUrl}
                        <video src={videoUrl} style="width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0;border-radius:inherit;background:#000;" controls></video>
                    {:else}
                        <div class="preview-ph"><i class="ti ti-player-play" aria-hidden="true"></i><span>{selectedFile?.name}</span></div>
                    {/if}
                    <button class="btn-rm" aria-label="Remove file" onclick={removeFile}><i class="ti ti-x" aria-hidden="true"></i></button>
                </div>
            </div>
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">{getFileExtension(selectedFile?.name || '')} · {formatSize(selectedFile?.size || 0)}</div>
            </div>
            <div class="settings">
                <div class="setting-row">
                    <div class="setting-lbl">{texts.autoOptimizeLbl}</div>
                    <div class="setting-ctl">
                        <button class="toggle" class:on={autoOptimize} onclick={() => autoOptimize = !autoOptimize} aria-label={texts.autoOptimizeLbl}></button>
                    </div>
                </div>
                <div class="setting-row top target-size-row" style={autoOptimize ? 'opacity:.4;pointer-events:none' : ''}>
                    <div class="setting-lbl" style="padding-top:9px">{texts.sizeLbl}</div>
                    <div class="setting-ctl">
                        <div class="size-row">
                            <div class="size-input-line">
                                <input class="size-input" type="number" placeholder="e.g. 25" min="1" bind:value={targetSize} tabindex={autoOptimize ? -1 : 0}>
                                <span class="unit">MB</span>
                            </div>
                        </div>
                    </div>
                    <div class="tag-row target-tags-full">
                        <span class="tag" class:on={targetSize === '25'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '25'} onkeydown={(e) => e.key==='Enter' && (targetSize='25')}>Gmail/25MB</span>
                        <span class="tag" class:on={targetSize === '8'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '8'} onkeydown={(e) => e.key==='Enter' && (targetSize='8')}>Discord/8MB</span>
                        <span class="tag" class:on={targetSize === '50'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '50'} onkeydown={(e) => e.key==='Enter' && (targetSize='50')}>Line/50MB</span>
                        <span class="tag" class:on={targetSize === '100'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '100'} onkeydown={(e) => e.key==='Enter' && (targetSize='100')}>Slack/100MB</span>
                        <span class="tag" class:on={targetSize === '200'} role="button" tabindex={autoOptimize ? -1 : 0} onclick={() => targetSize = '200'} onkeydown={(e) => e.key==='Enter' && (targetSize='200')}>WhatsApp/200MB</span>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" onclick={startCompression}>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnCompress}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnCompress}</span>
                </button>
            </div>
        {/if}

        {#if status === 'proc'}
            <div class="preview-frame">
                <div class="preview-main" style="overflow: hidden; position: relative;">
                    {#if videoUrl}
                        <video src={videoUrl} style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:inherit;opacity:0.5" muted></video>
                    {:else}
                        <div class="preview-ph"><i class="ti ti-player-play" aria-hidden="true"></i><span>{selectedFile?.name}</span></div>
                    {/if}
                </div>
            </div>
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">{getFileExtension(selectedFile?.name || '')} · {formatSize(selectedFile?.size || 0)}</div>
            </div>
            <div class="settings">
                <div class="setting-row" style="opacity:.4;pointer-events:none">
                    <div class="setting-lbl">{texts.autoOptimizeLbl}</div>
                    <div class="setting-ctl">
                        <button class="toggle" class:on={autoOptimize} aria-label={texts.autoOptimizeLbl}></button>
                    </div>
                </div>
                <div class="setting-row top target-size-row" style="opacity:.4;pointer-events:none">
                    <div class="setting-lbl" style="padding-top:9px">{texts.sizeLbl}</div>
                    <div class="setting-ctl">
                        <div class="size-row">
                            <div class="size-input-line">
                                <input class="size-input" type="number" placeholder="e.g. 25" min="1" disabled value={targetSize}>
                                <span class="unit">MB</span>
                            </div>
                        </div>
                    </div>
                    <div class="tag-row target-tags-full">
                        <span class="tag" class:on={targetSize === '25'}>Gmail/25MB</span>
                        <span class="tag" class:on={targetSize === '8'}>Discord/8MB</span>
                        <span class="tag" class:on={targetSize === '50'}>Line/50MB</span>
                        <span class="tag" class:on={targetSize === '100'}>Slack/100MB</span>
                        <span class="tag" class:on={targetSize === '200'}>WhatsApp/200MB</span>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled>
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progress}% — {texts.procCompressing}</span>
                    <span class="cta-mobile" style="display:none">{progress}% — {texts.procCompressing}</span>
                </button>
                <div class="prog-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    <div class="prog-fill" style="width: {progress}%"></div>
                </div>
            </div>
        {/if}

        {#if status === 'done'}
            <div class="done-frame">
                <div class="preview-main" style="overflow: hidden; position: relative;">
                    {#if videoUrl}
                        <video src={videoUrl} style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:inherit;opacity:0.3" muted></video>
                    {:else}
                        <div class="preview-ph" style="opacity:.25;color:#fff"><i class="ti ti-player-play" aria-hidden="true"></i></div>
                    {/if}
                </div>
            </div>
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">
                    {getFileExtension(selectedFile?.name || '')} · 
                    <span style="text-decoration:line-through;opacity:.6">{formatSize(selectedFile?.size || 0)}</span>
                    &nbsp;→&nbsp;<span style="color:var(--green);font-weight:600">{formatSize(compressedSize)}</span>
                    <span style="color:var(--green);margin-left:4px;font-weight:500">↓ {((1 - compressedSize / (selectedFile?.size || 1)) * 100).toFixed(1)}%</span>
                </div>
            </div>
            <hr class="settings-divider">
            <div class="done-cta">
                <button class="btn-dl">
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnDownload}</span>
                </button>
                <button class="btn-default" style="width:100%;justify-content:center" onclick={reset}>
                    <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnCompressNew}
                </button>
            </div>
        {/if}

    </div>
</div>

<input type="file" bind:this={fileInput} accept="video/*" style="display:none" onchange={handleFileChange}>

<style>
    /* CSS is handled globally in app.css */
</style>
