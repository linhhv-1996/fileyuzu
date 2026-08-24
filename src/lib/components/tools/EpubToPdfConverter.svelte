<script lang="ts">
    import { onMount } from 'svelte';
    import Share from '../Share.svelte';
    import { formatSize } from '$lib/utils';
    import { adsManager } from "$lib/utils/adsManager";
    
    const AD_LINKS = [
        'aHR0cHM6Ly9vbWcxMC5jb20vNC8xMTY0MTE3MA=='
    ];
    
    let { texts } = $props<{
        texts: {
            title: string;
            subtitle: string;
            btnSelect: string;
            btnSample?: string;
            hint: string;
            btnConvert: string;
            btnDownload: string;
            btnConvertNew: string;
            procInitializing: string;
            procReading: string;
            procConverting: string;
            error: string;
            success?: string;
        }
    }>();
    
    let status = $state<'idle' | 'file' | 'proc' | 'done'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let isDragging = $state(false);
    let isLoadingSample = $state(false);
    
    let progress = $state(0);
    let progressMessage = $state('');
    let outputUrl = $state<string | null>(null);
    let outputSize = $state(0);
    let errorMessage = $state<string | null>(null);
    
    let iframeRef = $state<HTMLIFrameElement | null>(null);
    let frameReady = $state(false);
    
    onMount(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;
            
            if (data.type === 'loaded') {
                // worker is loaded
            } else if (data.type === 'progress') {
                status = 'proc';
                
                if (data.pct !== undefined) {
                    progress = data.pct;
                }

                if (data.stage === 'converting') {
                    progressMessage = `${progress}% — ${texts.procConverting}`;
                } else {
                    progressMessage = texts.procInitializing;
                }
            } else if (data.type === 'result') {
                progress = 100;
                const blob = new Blob([data.outputData], { type: 'application/pdf' });
                outputSize = blob.size;
                if (outputUrl) URL.revokeObjectURL(outputUrl);
                outputUrl = URL.createObjectURL(blob);
                status = 'done';
            } else if (data.type === 'error') {
                errorMessage = data.error || texts.error;
                status = 'file'; // revert back to file so they can retry
                console.log(errorMessage);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    });

    function setFile(file: File) {
        selectedFile = file;
        status = 'file';
        errorMessage = null;
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
            setFile(e.dataTransfer.files[0]);
        }
    }
    
    function removeFile() {
        selectedFile = null;
        if (outputUrl) {
            URL.revokeObjectURL(outputUrl);
            outputUrl = null;
        }
        if (fileInput) fileInput.value = '';
        status = 'idle';
        errorMessage = null;
    }
    
    async function startConversion() {
        if (!selectedFile || !iframeRef?.contentWindow || !frameReady) return;
        
        status = 'proc';
        progress = 0;
        progressMessage = texts.procReading;
        errorMessage = null;
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            
            iframeRef.contentWindow.postMessage({
                type: 'convert',
                fileBuffer: arrayBuffer,
                fileName: selectedFile.name
            }, '*', [arrayBuffer]); // Transfer ownership of ArrayBuffer for performance
            
        } catch (err: any) {
            console.error('Conversion error:', err);
            errorMessage = err.message || texts.error;
            status = 'file';
        }
    }
    
    function reset() {
        removeFile();
    }
    
    function getFileExtension(filename: string) {
        return filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    }
    function credentiallessAction(node: HTMLIFrameElement) {
        node.setAttribute('credentialless', '');
    }
</script>

<!-- Hidden iframe for Web Worker COOP/COEP isolation -->
<iframe
    bind:this={iframeRef}
    src="/epub-to-pdf-frame"
    title="Background Processor"
    style="display: none; width: 0; height: 0; border: none;"
    use:credentiallessAction
    allow="cross-origin-isolated"
    onload={() => { frameReady = true; iframeRef?.contentWindow?.postMessage({ type: 'init' }, '*'); }}
></iframe>

<div class="card">
    <div class="tool-body">

        {#if status === 'idle'}
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" aria-label={texts.title} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.title}</p>
                <p class="sub">{texts.subtitle}</p>
                <div class="btn-row" style="justify-content: center;">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch('/CrimePunishment-EPUB2.epub')
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], "CrimePunishment-EPUB2.epub", { type: "application/epub+zip" }));
                            })
                            .catch(err => {
                                console.error(err);
                                alert('Could not load sample file');
                            })
                            .finally(() => {
                                isLoadingSample = false;
                            });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || 'Load sample'}
                        {:else}
                            <i class="ti ti-book" aria-hidden="true"></i> {texts.btnSample || 'Load sample'}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint}</p>
                <p class="hint hint-mobile">{texts.hint}</p>
            </div>
            
            <div class="settings">
                <hr class="settings-divider" style="margin-top:0">
                <button class="btn-cta" disabled>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnConvert}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnConvert}</span>
                </button>
            </div>
        {/if}

        {#if status !== 'idle'}
            <div class={status === 'done' ? "done-frame" : "preview-frame"}>
                <div class="preview-main {status === 'done' ? 'pdf-preview' : ''}" style="overflow: hidden; position: relative; {status !== 'done' ? 'background: #1e293b;' : ''}">
                    {#if status === 'done' && outputUrl}
                        <iframe src={outputUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview" style="width: 100%; height: 100%; border: none;"></iframe>
                    {:else}
                        <div class="preview-ph" style="color:#fff">
                            <i class="ti ti-book" aria-hidden="true" style="font-size: 3rem; margin-bottom: 0.5rem; display: block;"></i>
                            <span>{selectedFile?.name}</span>
                        </div>
                    {/if}
                    {#if status === 'file'}
                        <button class="btn-rm" aria-label="Remove file" onclick={removeFile}><i class="ti ti-x" aria-hidden="true"></i></button>
                    {/if}
                </div>
            </div>
            
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">
                    {getFileExtension(selectedFile?.name || '')} · 
                    {#if status === 'done'}
                        {formatSize(selectedFile?.size || 0)}
                        &nbsp;→&nbsp;<span style="color:var(--green);font-weight:600">PDF · {formatSize(outputSize)}</span>
                    {:else}
                        {formatSize(selectedFile?.size || 0)}
                    {/if}
                </div>
            </div>
        {/if}

        {#if status === 'file'}
            <div class="settings">
                <hr class="settings-divider" style="margin-top:0">
                <button class="btn-cta" onclick={startConversion} disabled={!frameReady}>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnConvert}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnConvert}</span>
                </button>
            </div>
        {/if}

        {#if status === 'proc'}
            <div class="settings">
                <hr class="settings-divider" style="margin-top:0">
                <button class="btn-cta" disabled style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;">
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progressMessage}</span>
                    <span class="cta-mobile" style="display:none">{progressMessage}</span>
                </button>
            </div>
        {/if}

        {#if status === 'done'}
            <hr class="settings-divider">
            <div class="done-cta">
                <button class="btn-dl" onclick={() => {
                    adsManager.triggerAd(AD_LINKS, 'epub_to_pdf_download');
                    if (outputUrl && selectedFile) {
                        const a = document.createElement('a');
                        a.href = outputUrl;
                        a.download = selectedFile.name.replace(/\.[^.]+$/, '') + '.pdf';
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

        <div class="card-footer">
            <Share title={texts.title} />
        </div>

    </div>
</div>

<input type="file" bind:this={fileInput} accept=".epub,.mobi,.azw3,.fb2,.cbz,.cbr" style="display:none" onchange={handleFileChange}>

<style>
.card-footer {
    padding: 8px 16px;
}
.upload-box {
    min-height: 300px;
}
</style>
