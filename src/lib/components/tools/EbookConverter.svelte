<script lang="ts">
    import { onMount, tick } from 'svelte';
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
            selectOutput?: string;
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
    let resultRef = $state<HTMLElement | null>(null);

    let formats = ['pdf', 'epub', 'mobi', 'fb2', 'azw3'];
    let selectedOutputFormat = $state('pdf');
    
    let lastGeneratedSignature = $state("");
    let isDirty = $derived(
        JSON.stringify({
            fileName: selectedFile?.name,
            selectedOutputFormat
        }) !== lastGeneratedSignature
    );
    
    onMount(() => {
        const handleMessage = async (event: MessageEvent) => {
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
                // output type mapping
                let mimeType = 'application/octet-stream';
                if (selectedOutputFormat === 'pdf') mimeType = 'application/pdf';
                else if (selectedOutputFormat === 'epub') mimeType = 'application/epub+zip';
                else if (selectedOutputFormat === 'mobi') mimeType = 'application/x-mobipocket-ebook';
                else if (selectedOutputFormat === 'fb2') mimeType = 'application/x-fictionbook+xml';
                else if (selectedOutputFormat === 'azw3') mimeType = 'application/vnd.amazon.mobi8-ebook';

                const blob = new Blob([data.outputData], { type: mimeType });
                outputSize = blob.size;
                if (outputUrl) URL.revokeObjectURL(outputUrl);
                outputUrl = URL.createObjectURL(blob);
                status = 'done';
                lastGeneratedSignature = JSON.stringify({
                    fileName: selectedFile?.name,
                    selectedOutputFormat
                });
                
                await tick();
                if (resultRef) {
                    resultRef.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (data.type === 'error') {
                errorMessage = data.error || texts.error;
                status = 'file'; // revert back to file so they can retry
                console.log(errorMessage);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    });

    let inputPdfUrl = $state<string | null>(null);

    function setFile(file: File) {
        selectedFile = file;
        status = 'file';
        errorMessage = null;
        
        const ext = getFileExtension(file.name).toLowerCase();
        if (ext === 'pdf') {
            selectedOutputFormat = 'epub';
        } else {
            selectedOutputFormat = 'pdf';
        }

        if (file.type === 'application/pdf' || ext === 'pdf') {
            if (inputPdfUrl) URL.revokeObjectURL(inputPdfUrl);
            inputPdfUrl = URL.createObjectURL(file);
        } else {
            if (inputPdfUrl) URL.revokeObjectURL(inputPdfUrl);
            inputPdfUrl = null;
        }
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
        if (inputPdfUrl) {
            URL.revokeObjectURL(inputPdfUrl);
            inputPdfUrl = null;
        }
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
                fileName: selectedFile.name,
                targetFormat: selectedOutputFormat
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
    src="/ebook-converter-frame"
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
                        fetch('/sample_pdf.pdf')
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], "sample_pdf.pdf", { type: "application/pdf" }));
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
        {:else}
            <div class="preview-frame">
                <div class="preview-main {inputPdfUrl ? 'pdf-preview' : ''}" style="overflow: hidden; position: relative;">
                    {#if inputPdfUrl}
                        <iframe src={inputPdfUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview" style="width: 100%; height: 100%; border: none;"></iframe>
                    {:else}
                        <div class="preview-ph" style="color:#fff">
                            <i class="ti ti-book" aria-hidden="true" style="font-size: 8rem; margin-bottom: 0.5rem; display: block;"></i>
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
                    {getFileExtension(selectedFile?.name || '')} · {formatSize(selectedFile?.size || 0)}
                </div>
            </div>
        {/if}
        
        <!-- ALWAYS SHOW SETTINGS -->
        <div class="settings">
            <!-- <hr class="settings-divider" style="margin-top:0"> -->
            <div class="setting-row">
                <div class="setting-lbl">{texts.selectOutput || 'Select output format:'}</div>
                <div class="tag-row" style={status === 'proc' ? 'pointer-events: none; opacity: 0.5;' : ''}>
                    {#each formats as format}
                        <span 
                            class="tag" 
                            class:on={selectedOutputFormat === format} 
                            style={getFileExtension(selectedFile?.name || '').toLowerCase() === format ? 'opacity: 0.4; pointer-events: none;' : ''}
                            role="button" 
                            tabindex="0" 
                            onclick={() => selectedOutputFormat = format}
                            onkeydown={(e) => e.key === 'Enter' && (selectedOutputFormat = format)}
                        >
                            {format.toUpperCase()}
                        </span>
                    {/each}
                </div>
            </div>
            <hr class="settings-divider">
            
            {#if status === 'proc'}
                <button class="btn-cta" disabled style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;">
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progressMessage}</span>
                    <span class="cta-mobile" style="display:none">{progressMessage}</span>
                </button>
            {:else}
                <button class="btn-cta" onclick={startConversion} disabled={status === 'idle' || !frameReady || (status === 'done' && !isDirty)}>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnConvert.replace('{format}', selectedOutputFormat.toUpperCase())}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnConvert.replace('{format}', selectedOutputFormat.toUpperCase())}</span>
                </button>
            {/if}
        </div>

        <!-- ONLY SHOW RESULT WHEN DONE -->
        {#if status === 'done' && !isDirty}
            <div bind:this={resultRef} style="scroll-margin-top: 100px;"></div>
            
            <div style="height: 16px;"></div>

            <div class="done-frame" class:is-placeholder={selectedOutputFormat !== 'pdf'}>
                <div class="preview-main {selectedOutputFormat === 'pdf' ? 'pdf-preview' : ''}" style="overflow: hidden; position: relative;">
                    {#if outputUrl && selectedOutputFormat === 'pdf'}
                        <iframe src={outputUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview" style="width: 100%; height: 100%; border: none;"></iframe>
                    {:else}
                        <div class="preview-ph" style="color:#fff">
                            <i class="ti ti-file-check" aria-hidden="true" style="font-size: 8rem; margin-bottom: 0.5rem; display: block; color: var(--green);"></i>
                        </div>
                    {/if}
                </div>
            </div>
            
            <div class="vid-info">
                <div class="fn">{selectedFile?.name?.replace(/\.[^.]+$/, '') + '.' + selectedOutputFormat}</div>
                <div class="fm">
                    {getFileExtension(selectedFile?.name || '')} · 
                    <span style="opacity:.6">{formatSize(selectedFile?.size || 0)}</span>
                    &nbsp;→&nbsp;<span style="color:var(--green);font-weight:600">{selectedOutputFormat.toUpperCase()} · {formatSize(outputSize)}</span>
                </div>
            </div>

            <!-- Action bar at the bottom -->
            <div class="settings">
                <!-- <hr class="settings-divider" /> -->
                <div class="done-cta">
                    <button class="btn-dl" onclick={() => {
                        adsManager.triggerAd(AD_LINKS, 'ebook_converter_download');
                        setTimeout(() => {
                            if (outputUrl && selectedFile) {
                                const a = document.createElement('a');
                                a.href = outputUrl;
                                a.download = selectedFile.name.replace(/\.[^.]+$/, '') + '.' + selectedOutputFormat;
                                a.click();
                            }
                        }, 100);
                    }}>
                        <i class="ti ti-download" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts.btnDownload.replace('{format}', selectedOutputFormat.toUpperCase())}</span>
                        <span class="cta-mobile" style="display:none">{texts.btnDownload.replace('{format}', selectedOutputFormat.toUpperCase())}</span>
                    </button>
                    <button class="btn-default" style="width:100%;justify-content:center" onclick={reset}>
                        <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnConvertNew}
                    </button>
                </div>
            </div>
        {/if}

        <div class="card-footer">
            <Share title={texts.title} />
        </div>

    </div>
</div>

<input type="file" bind:this={fileInput} accept=".pdf,.epub,.mobi,.azw3,.fb2,.cbz,.cbr" style="display:none" onchange={handleFileChange}>

<style>
.preview-frame{
    height: 320px;
}
.done-frame.is-placeholder {
    height: 250px;
}
.setting-row:last-of-type {
    align-items: start;
}
.card-footer {
    padding: 8px 16px;
}
.upload-box {
    min-height: 300px;
}
</style>
