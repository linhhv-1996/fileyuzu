<script lang="ts">
    import Share from '../Share.svelte';
    import { formatSize } from '$lib/utils';
    
    interface Props {
        texts?: any;
    }
    
    let { texts = {} }: Props = $props();
    
    let status = $state<'idle' | 'file' | 'proc' | 'done'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let pdfUrl = $state<string | null>(null);
    let isDragging = $state(false);
    let isLoadingSample = $state(false);
    let isPdfLoading = $state(false);
    
    // Scanner Settings
    let intensity = $state<number>(2);
    let scanStyle = $state<'bw' | 'grainy' | 'vintage' | 'color'>('bw');
    
    // PDF extraction
    let pdfDoc: any = null;
    let pdfPagesCount = $state(0);
    
    let progress = $state(0);
    let processedFile = $state<File | null>(null);
    let originalSize = $state(0);
    let processedSize = $state(0);

    async function setFile(file: File) {
        selectedFile = file;
        originalSize = file.size;
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = URL.createObjectURL(file);
        status = 'file';
        isPdfLoading = true;
        pdfPagesCount = 0;

        try {
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
            const { default: pdfWorkerUrl } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
            
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            pdfDoc = await loadingTask.promise;
            pdfPagesCount = pdfDoc.numPages;
        } catch (err) {
            console.error('Error reading PDF pages with pdfjs:', err);
            alert("Could not parse PDF file. Ensure it is not corrupted.");
            removeFile();
        }
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) setFile(target.files[0]);
    }

    function handleDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); isDragging = true; }
    function handleDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); isDragging = false; }
    function handleDrop(e: DragEvent) {
        e.preventDefault(); e.stopPropagation(); isDragging = false;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') setFile(file);
            else alert('Please drop a PDF file.');
        }
    }
    
    function removeFile() {
        selectedFile = null;
        processedFile = null;
        pdfDoc = null;
        if (pdfUrl) { URL.revokeObjectURL(pdfUrl); pdfUrl = null; }
        if (fileInput) fileInput.value = '';
        status = 'idle';
    }
    
    import PDFWorker from '../../workers/pdf-scanner-worker.ts?worker';

    async function extractAllPagesForWorker(): Promise<string[]> {
        const images: string[] = [];
        if (!pdfDoc) return images;
        for (let i = 1; i <= pdfPagesCount; i++) {
            progress = 10 + Math.floor((i / pdfPagesCount) * 20); // extraction takes 20%
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                images.push(canvas.toDataURL('image/jpeg', 0.8));
            }
        }
        return images;
    }

    function processPdf(images: string[]): Promise<File> {
        return new Promise((resolve, reject) => {
            const worker = new PDFWorker();
            
            worker.onmessage = (e) => {
                worker.terminate();
                const { success, pdfData, error } = e.data;
                if (success && pdfData) {
                    const blob = new Blob([pdfData], { type: 'application/pdf' });
                    const outName = selectedFile!.name.replace(/\.pdf$/i, '_scanned.pdf');
                    resolve(new File([blob], outName, { type: 'application/pdf' }));
                } else {
                    reject(new Error(error || 'Processing failed'));
                }
            };
            
            worker.onerror = (err) => {
                worker.terminate();
                reject(err);
            };
            
            worker.postMessage({
                id: Date.now(),
                images,
                intensity,
                scanStyle
            });
        });
    }

    async function startProcessing() {
        if (!selectedFile) return;
        status = 'proc';
        progress = 5;
        processedFile = null;
        
        try {
            // 1. Extract images
            const images = await extractAllPagesForWorker();
            
            // 2. Process in python
            progress = 30;
            const progressInterval = setInterval(() => {
                if (progress < 90) progress += Math.floor(Math.random() * 3) + 1;
            }, 800);

            const resultFile = await processPdf(images);
            
            clearInterval(progressInterval);
            progress = 100;
            processedFile = resultFile;
            processedSize = resultFile.size;
            
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            pdfUrl = URL.createObjectURL(resultFile);
            
            status = 'done';

        } catch (err: any) {
            console.error('Processing error:', err);
            alert(err.message || 'Error occurred during processing');
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
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-file-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle}</p>
                <p class="sub">{texts.uploadSubtitle}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch('/sample_pdf.pdf')
                            .then(res => res.blob())
                            .then(blob => setFile(new File([blob], "sample_pdf.pdf", { type: "application/pdf" })))
                            .finally(() => { isLoadingSample = false; });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || ''}
                        {:else}
                            <i class="ti ti-file" aria-hidden="true"></i> {texts.btnSample || ''}
                        {/if}
                    </button>
                </div>
                {#if texts.hint}
                    <p class="hint">{texts.hint}</p>
                {/if}
            </div>
            
            <input type="file" bind:this={fileInput} onchange={handleFileChange} accept="application/pdf" class="hidden-el" />
        {/if}

        {#if status !== 'idle'}
            <div class={status === 'done' ? "done-frame" : "preview-frame"}>
                <div class="preview-main pdf-preview">
                    {#if isPdfLoading}
                        <div class="pdf-loading-overlay">
                            <span class="spin pdf-spinner"><i class="ti ti-loader-2" aria-hidden="true"></i></span>
                        </div>
                    {/if}
                    
                    <iframe src={pdfUrl + '#toolbar=0'} onload={() => isPdfLoading = false} class="pdf-iframe" class:loading={isPdfLoading} title="PDF Preview"></iframe>
                    
                    {#if status === 'file'}
                        <button class="btn-rm pdf-rm-btn" aria-label="Remove file" onclick={removeFile}><i class="ti ti-x" aria-hidden="true"></i></button>
                    {/if}
                    {#if pdfPagesCount > 0}
                        <div class="pdf-page-count">
                            {pdfPagesCount} {texts.pages || 'pages'}
                        </div>
                    {/if}
                </div>
            </div>
            
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">
                    {getFileExtension(selectedFile?.name || '')} · 
                    {#if status === 'done'}
                        <span>{formatSize(originalSize)}</span>
                        &nbsp;→&nbsp;<span class="text-green-bold">{formatSize(processedSize)}</span>
                    {:else}
                        {formatSize(originalSize)}
                    {/if}
                </div>
            </div>
        {/if}

        {#if status === 'file'}
            <div class="settings">
                <div class="setting-row">
                    <div class="setting-lbl">{texts.settingsIntensity || 'Scanner Effect Intensity (1-5)'}</div>
                    <div class="setting-ctl" style="display: flex; gap: 1rem; align-items: center; width: 100%;">
                        <input type="range" min="1" max="5" bind:value={intensity} style="flex: 1;">
                        <span style="font-weight: 500;">{texts.level || 'Level'} {intensity}</span>
                    </div>
                </div>
                
                <div class="setting-row top">
                    <div class="setting-lbl">{texts.settingsStyle || 'Scanner Style'}</div>
                    <div class="setting-ctl">
                        <div class="tag-row">
                            <span class="tag" class:on={scanStyle === 'bw'} role="button" tabindex="0" onclick={() => scanStyle = 'bw'} onkeydown={(e) => e.key==='Enter' && (scanStyle='bw')}>{texts.styleBw || 'B&W Photocopy'}</span>
                            <span class="tag" class:on={scanStyle === 'grainy'} role="button" tabindex="0" onclick={() => scanStyle = 'grainy'} onkeydown={(e) => e.key==='Enter' && (scanStyle='grainy')}>{texts.styleGrainy || 'Grainy Noise'}</span>
                            <span class="tag" class:on={scanStyle === 'vintage'} role="button" tabindex="0" onclick={() => scanStyle = 'vintage'} onkeydown={(e) => e.key==='Enter' && (scanStyle='vintage')}>{texts.styleVintage || 'Vintage Paper'}</span>
                            <span class="tag" class:on={scanStyle === 'color'} role="button" tabindex="0" onclick={() => scanStyle = 'color'} onkeydown={(e) => e.key==='Enter' && (scanStyle='color')}>{texts.styleColor || 'Modern Color'}</span>
                        </div>
                    </div>
                </div>
                
                <hr class="settings-divider">
                <button class="btn-cta" onclick={startProcessing} disabled={isPdfLoading}>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnProcess || 'Apply Scanner Effect'}</span>
                    <span class="cta-mobile hidden-el">{texts.btnProcess || 'Apply'}</span>
                </button>
            </div>
        {/if}

        {#if status === 'proc'}
            <div class="settings">
                <div class="setting-row disabled-row">
                    <div class="setting-lbl">{texts.settingsIntensity || 'Scanner Effect Intensity (1-5)'}</div>
                    <div class="setting-ctl" style="display: flex; gap: 1rem; align-items: center; width: 100%;">
                        <input type="range" min="1" max="5" value={intensity} disabled style="flex: 1;">
                        <span style="font-weight: 500; opacity: 0.5;">{texts.level || 'Level'} {intensity}</span>
                    </div>
                </div>
                <div class="setting-row top disabled-row">
                    <div class="setting-lbl">{texts.settingsStyle || 'Scanner Style'}</div>
                    <div class="setting-ctl">
                        <div class="tag-row">
                            <span class="tag" class:on={scanStyle === 'bw'}>{texts.styleBw || 'B&W Photocopy'}</span>
                            <span class="tag" class:on={scanStyle === 'grainy'}>{texts.styleGrainy || 'Grainy Noise'}</span>
                            <span class="tag" class:on={scanStyle === 'vintage'}>{texts.styleVintage || 'Vintage Paper'}</span>
                            <span class="tag" class:on={scanStyle === 'color'}>{texts.styleColor || 'Modern Color'}</span>
                        </div>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;">
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progress}% — {texts.procProcessing || 'Processing...'}</span>
                    <span class="cta-mobile hidden-el">{progress}% — {texts.procProcessing || 'Processing...'}</span>
                </button>
            </div>
        {/if}

        {#if status === 'done'}
            <hr class="settings-divider">
            <div class="done-cta">
                <button class="btn-dl" onclick={() => {
                    if (processedFile && pdfUrl) {
                        const a = document.createElement('a');
                        a.href = pdfUrl;
                        a.download = processedFile.name;
                        a.click();
                    }
                }}>
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload || 'Download PDF'}</span>
                    <span class="cta-mobile hidden-el">{texts.btnDownload || 'Download'}</span>
                </button>
                <button class="btn-default w-full" style="justify-content: center;" onclick={reset}>
                    <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnProcessNew || 'Process New File'}
                </button>
            </div>
        {/if}
        
        <div class="card-footer">
            <Share title={texts?.uploadTitle || 'Make PDF Look Scanned'} />
        </div>
    </div>
</div>

<style>
    .done-frame{
        height: 400px;
    }
    .upload-box{
        min-height: 300px;
    }
    .preview-frame{
        height: 300px;
    }
    .card-footer { padding: 8px 16px; }
    .w-full { width: 100%; }
    .pdf-preview { overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: #e5e7eb; width: 100%; min-height: 400px; }
    .pdf-loading-overlay { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text); z-index: 5; }
    .pdf-spinner { font-size: 2rem; margin-bottom: 0.5rem; }
    .pdf-iframe { width: 100%; height: 100%; border: none; min-height: 400px; display: block; transition: opacity 0.3s; opacity: 1; }
    .pdf-iframe.loading { opacity: 0; }
    .pdf-rm-btn { z-index: 10; }
    .pdf-page-count { position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,0,0,0.6); color: white; font-size: 0.8rem; padding: 4px 10px; border-radius: 999px; font-weight: 500; backdrop-filter: blur(4px); }
    .text-green-bold { color: var(--green); font-weight: 600; }
    .hidden-el { display: none; }
</style>
