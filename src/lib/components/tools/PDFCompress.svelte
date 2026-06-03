<script lang="ts">
    import { formatSize } from '$lib/utils';
    
    interface Props {
        texts?: any;
    }
    
    let { texts = {} }: Props = $props();
    
    let status = $state<'idle' | 'file' | 'proc' | 'done'>('idle');
    let fileInput = $state<HTMLInputElement | undefined>();
    let selectedFile = $state<File | null>(null);
    let quality = $state<'balanced' | 'maximum'>('balanced');
    let password = $state('');
    let pdfUrl = $state<string | null>(null);
    let isDragging = $state(false);
    let isLoadingSample = $state(false);
    let isPdfLoading = $state(false);
    let pdfPages = $state<number | null>(null);
    
    let progress = $state(0);
    let compressedSize = $state(0);
    let compressedFile = $state<File | null>(null);

    async function setFile(file: File) {
        selectedFile = file;
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = URL.createObjectURL(file);
        status = 'file';
        isPdfLoading = true;
        pdfPages = null;

        try {
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
            const { default: pdfWorkerUrl } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
            
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;
            pdfPages = pdf.numPages;
        } catch (err) {
            console.error('Error reading PDF pages with pdfjs:', err);
            try {
                // Fallback: fast regex search for pages
                const text = await file.text();
                const matches = text.match(/\/Type\s*\/Page\b/g);
                pdfPages = matches ? matches.length : 1;
            } catch (fallbackErr) {
                pdfPages = 1;
            }
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
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setFile(file);
            } else {
                alert('Please drop a PDF file.');
            }
        }
    }
    
    function removeFile() {
        selectedFile = null;
        compressedFile = null;
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            pdfUrl = null;
        }
        if (fileInput) fileInput.value = '';
        status = 'idle';
    }
    
    import PDFWorker from '../../workers/pdf-compress-worker.ts?worker';

    function compressPdfFile(file: File, quality: string, pass: string): Promise<File> {
        return new Promise((resolve, reject) => {
            const worker = new PDFWorker();
            
            const localFileUrl = URL.createObjectURL(file);
            
            worker.onmessage = (e) => {
                URL.revokeObjectURL(localFileUrl);
                worker.terminate();
                
                const { success, pdfData, error } = e.data;
                if (success && pdfData) {
                    const blob = new Blob([pdfData], { type: 'application/pdf' });
                    const outName = file.name.replace(/\.pdf$/i, '_compressed.pdf');
                    resolve(new File([blob], outName, { type: 'application/pdf' }));
                } else {
                    reject(new Error(error || 'Compression failed'));
                }
            };
            
            worker.onerror = (err) => {
                URL.revokeObjectURL(localFileUrl);
                worker.terminate();
                reject(err);
            };
            
            worker.postMessage({
                fileUrl: localFileUrl,
                quality,
                password: pass
            });
        });
    }

    async function startCompression() {
        if (!selectedFile) return;
        status = 'proc';
        progress = 10;
        compressedFile = null;
        
        try {
            // Fake progress animation
            const progressInterval = setInterval(() => {
                if (progress < 90) progress += Math.floor(Math.random() * 10) + 1;
            }, 500);

            const resultFile = await compressPdfFile(selectedFile, quality, password);
            
            clearInterval(progressInterval);
            progress = 100;
            compressedSize = resultFile.size;
            compressedFile = resultFile;
            
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            pdfUrl = URL.createObjectURL(resultFile);
            
            status = 'done';

        } catch (err: any) {
            console.error('Compression error:', err);
            alert(err.message || 'Error occurred during compression');
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
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found, using mock.');
                                return res.blob();
                            })
                            .then(blob => {
                                setFile(new File([blob], "sample_pdf.pdf", { type: "application/pdf" }));
                            })
                            .catch(() => {
                                setFile(new File(["sample content"], "sample_pdf.pdf", { type: "application/pdf" }));
                            })
                            .finally(() => {
                                isLoadingSample = false;
                            });
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || 'Load sample'}
                        {:else}
                            <i class="ti ti-file" aria-hidden="true"></i> {texts.btnSample || 'Load sample'}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint}</p>
                <p class="hint hint-mobile">{texts.hint}</p>
            </div>
            
            <div class="settings">
                <div class="setting-row">
                    <div class="setting-lbl">{texts.qualityLbl || 'Quality preset'}</div>
                    <div class="setting-ctl">
                        <div class="tag-row">
                            <span class="tag" class:on={quality === 'balanced'} role="button" tabindex="0" onclick={() => quality = 'balanced'} onkeydown={(e) => e.key==='Enter' && (quality='balanced')}>{texts.qualityBalanced || 'Balanced (Ebook)'}</span>
                            <span class="tag" class:on={quality === 'maximum'} role="button" tabindex="0" onclick={() => quality = 'maximum'} onkeydown={(e) => e.key==='Enter' && (quality='maximum')}>{texts.qualityMaximum || 'Maximum (Screen)'}</span>
                        </div>
                    </div>
                </div>
                <div class="setting-row top">
                    <div class="setting-lbl" >{texts.passwordLbl || 'Password to unlock (optional)'}</div>
                    <div class="setting-ctl">
                        <div class="size-row w-full">
                            <form class="size-input-line w-full" onsubmit={(e) => e.preventDefault()}>
                                <input class="size-input w-full" type="password" autocomplete="new-password" placeholder={texts.passwordPlaceholder || "Password (if encrypted)"} bind:value={password}>
                            </form>
                        </div>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled><i class="ti ti-bolt" aria-hidden="true"></i> {texts.btnCompress}</button>
            </div>
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
                    {#if pdfPages !== null}
                        <div class="pdf-page-count">
                            {pdfPages} {texts.pages || 'pages'}
                        </div>
                    {/if}
                </div>
            </div>
            
            <div class="vid-info">
                <div class="fn">{selectedFile?.name}</div>
                <div class="fm">
                    {getFileExtension(selectedFile?.name || '')} · 
                    {#if status === 'done'}
                        <span class="strikethrough-dim">{formatSize(selectedFile?.size || 0)}</span>
                        &nbsp;→&nbsp;<span class="text-green-bold">{formatSize(compressedSize)}</span>
                        <span class="text-green-medium ml-1">↓ {((1 - compressedSize / (selectedFile?.size || 1)) * 100).toFixed(1)}%</span>
                    {:else}
                        {formatSize(selectedFile?.size || 0)}
                    {/if}
                </div>
            </div>
        {/if}

        {#if status === 'file'}
            <div class="settings">
                <div class="setting-row">
                    <div class="setting-lbl">{texts.qualityLbl || 'Quality preset'}</div>
                    <div class="setting-ctl">
                        <div class="tag-row">
                            <span class="tag" class:on={quality === 'balanced'} role="button" tabindex="0" onclick={() => quality = 'balanced'} onkeydown={(e) => e.key==='Enter' && (quality='balanced')}>{texts.qualityBalanced || 'Balanced (Ebook)'}</span>
                            <span class="tag" class:on={quality === 'maximum'} role="button" tabindex="0" onclick={() => quality = 'maximum'} onkeydown={(e) => e.key==='Enter' && (quality='maximum')}>{texts.qualityMaximum || 'Maximum (Screen)'}</span>
                        </div>
                    </div>
                </div>
                <div class="setting-row top">
                    <div class="setting-lbl" >{texts.passwordLbl || 'Password to unlock (optional)'}</div>
                    <div class="setting-ctl">
                        <div class="size-row w-full">
                            <form class="size-input-line w-full" onsubmit={(e) => e.preventDefault()}>
                                <input class="size-input w-full" type="password" autocomplete="new-password" placeholder={texts.passwordPlaceholder || "Password (if encrypted)"} bind:value={password}>
                            </form>
                        </div>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" onclick={startCompression}>
                    <i class="ti ti-bolt" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnCompress}</span>
                    <span class="cta-mobile hidden-el">{texts.btnCompress}</span>
                </button>
            </div>
        {/if}

        {#if status === 'proc'}
            <div class="settings">
                <div class="setting-row disabled-row">
                    <div class="setting-lbl">{texts.qualityLbl || 'Quality preset'}</div>
                    <div class="setting-ctl">
                        <div class="tag-row">
                            <span class="tag" class:on={quality === 'balanced'}>{texts.qualityBalanced || 'Balanced (Ebook)'}</span>
                            <span class="tag" class:on={quality === 'maximum'}>{texts.qualityMaximum || 'Maximum (Screen)'}</span>
                        </div>
                    </div>
                </div>
                <div class="setting-row top disabled-row">
                    <div class="setting-lbl" >{texts.passwordLbl || 'Password to unlock (optional)'}</div>
                    <div class="setting-ctl">
                        <div class="size-row w-full">
                            <form class="size-input-line w-full" onsubmit={(e) => e.preventDefault()}>
                                <input class="size-input w-full" type="password" autocomplete="new-password" disabled placeholder={texts.passwordPlaceholder || "Password (if encrypted)"} bind:value={password}>
                            </form>
                        </div>
                    </div>
                </div>
                <hr class="settings-divider">
                <button class="btn-cta" disabled style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;">
                    <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span>
                    <span class="cta-desktop">{progress}% — {texts.procCompressing}</span>
                    <span class="cta-mobile hidden-el">{progress}% — {texts.procCompressing}</span>
                </button>
            </div>
        {/if}

        {#if status === 'done'}
            <hr class="settings-divider">
            <div class="done-cta">
                <button class="btn-dl" onclick={() => {
                    if (compressedFile && pdfUrl) {
                        const a = document.createElement('a');
                        a.href = pdfUrl;
                        a.download = compressedFile.name;
                        a.click();
                    }
                }}>
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload}</span>
                    <span class="cta-mobile hidden-el">{texts.btnDownload}</span>
                </button>
                <button class="btn-default w-full justify-center" onclick={reset}>
                    <i class="ti ti-refresh" aria-hidden="true"></i> {texts.btnCompressNew}
                </button>
            </div>
        {/if}

    </div>
</div>

<input type="file" bind:this={fileInput} accept="application/pdf" class="hidden-el" onchange={handleFileChange}>

<style>
    /* Global CSS is in app.css, component-specific styles here */
    .w-full { width: 100%; }
    .pdf-preview { overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: #e5e7eb; width: 100%; min-height: 400px; }
    .pdf-loading-overlay { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text); z-index: 5; }
    .pdf-spinner { font-size: 2rem; margin-bottom: 0.5rem; }
    .pdf-iframe { width: 100%; height: 100%; border: none; min-height: 400px; display: block; transition: opacity 0.3s; opacity: 1; }
    .pdf-iframe.loading { opacity: 0; }
    .pdf-rm-btn { z-index: 10; }
    .pdf-page-count { position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,0,0,0.6); color: white; font-size: 0.8rem; padding: 4px 10px; border-radius: 999px; font-weight: 500; backdrop-filter: blur(4px); }
    .strikethrough-dim { text-decoration: line-through; opacity: 0.6; }
    .text-green-bold { color: var(--green); font-weight: 600; }
    .text-green-medium { color: var(--green); font-weight: 500; }
    .ml-1 { margin-left: 4px; }
    .disabled-row { opacity: 0.4; pointer-events: none; }
    .hidden-el { display: none !important; }
    .justify-center { justify-content: center; }
</style>
