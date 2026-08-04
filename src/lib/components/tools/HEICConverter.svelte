<script lang="ts">
    import Share from '../Share.svelte';
    import { onMount, tick, onDestroy } from 'svelte';
    import JSZip from 'jszip';
    import HeicWorker from '../../workers/heicWorker.ts?worker';

    interface Props {
        texts?: any;
    }

    let { texts = {} }: Props = $props();

    interface FileItem {
        id: string;
        file: File;
        url: string | null; // URL for the original if previewable, else null
        status: 'pending' | 'converting' | 'done' | 'error';
        resultUrl: string | null;
        resultBlob: Blob | null;
        resultName: string | null;
    }

    let files = $state<FileItem[]>([]);
    let isDragging = $state(false);
    let isConverting = $state(false);
    let isLoadingSample = $state(false);
    let isDone = $state(false);
    let pdfBlobUrl = $state<string | null>(null);

    let maxWidth = $state(0);
    let outputFormat = $state<'png' | 'jpg' | 'pdf'>('jpg');

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function handleFiles(newFiles: FileList | File[]) {
        const items = Array.from(newFiles)
            .filter(f => f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif'))
            .map(f => ({
                id: generateId(),
                file: f,
                url: null, // we don't try to preview HEIC natively
                status: 'pending' as const,
                resultUrl: null,
                resultBlob: null,
                resultName: null
            }));
        files = [...files, ...items];
        isDone = false;
    }

    function onFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            handleFiles(input.files);
        }
        input.value = "";
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function onDragLeave() {
        isDragging = false;
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        if (e.dataTransfer?.files) {
            handleFiles(e.dataTransfer.files);
        }
    }

    function removeFile(index: number) {
        const file = files[index];
        if (file.resultUrl) URL.revokeObjectURL(file.resultUrl);
        files = files.filter((_, i) => i !== index);
    }

    function clearAll() {
        files.forEach(f => {
            if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
        });
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        files = [];
        isDone = false;
        pdfBlobUrl = null;
    }

    function resetFilesState() {
        if (files.some(f => f.status === 'done' || f.status === 'error')) {
            files = files.map(f => ({ ...f, status: 'pending' }));
            isDone = false;
        }
    }

    function setFormat(fmt: 'png' | 'jpg' | 'pdf') {
        outputFormat = fmt;
        resetFilesState();
    }

    let worker: Worker | null = null;
    let workerResolvers = new Map<string, { resolve: Function, reject: Function }>();

    function initWorker() {
        if (!worker) {
            worker = new HeicWorker();
            worker.onmessage = (e) => {
                const { id, status, data, error } = e.data;
                const resolver = workerResolvers.get(id);
                if (resolver) {
                    if (status === 'success') resolver.resolve(data);
                    else resolver.reject(new Error(error));
                    workerResolvers.delete(id);
                }
            };
        }
    }

    function runWorkerTask(type: string, payload: any): Promise<any> {
        initWorker();
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9);
            workerResolvers.set(id, { resolve, reject });
            worker!.postMessage({ id, type, payload });
        });
    }

    onDestroy(() => {
        if (worker) {
            worker.terminate();
            worker = null;
        }
    });

    async function processFile(fileItem: FileItem) {
        try {
            fileItem.status = 'converting';
            
            const blobResult = await runWorkerTask('CONVERT_IMAGE', {
                file: fileItem.file,
                outputFormat,
                maxWidth
            });

            const ext = outputFormat === 'jpg' ? 'jpg' : outputFormat === 'pdf' ? 'pdf' : 'png';
            const originalName = fileItem.file.name.replace(/\.[^/.]+$/, "");
            fileItem.resultName = `${originalName}.${ext}`;
            fileItem.resultBlob = blobResult as Blob;
            fileItem.resultUrl = URL.createObjectURL(blobResult as Blob);
            fileItem.status = 'done';

        } catch (err) {
            console.error("Conversion error for " + fileItem.file.name, err);
            fileItem.status = 'error';
        }
    }

    async function convertAll() {
        if (files.length === 0) return;
        isConverting = true;
        
        try {
            for (let i = 0; i < files.length; i++) {
                if (files[i].status === 'pending' || files[i].status === 'error') {
                    await processFile(files[i]);
                    files = [...files];
                }
            }
            
            if (outputFormat === 'pdf') {
                const doneFiles = files.filter(f => f.status === 'done' && f.resultBlob);
                if (doneFiles.length > 0) {
                    const finalPdfBlob = await runWorkerTask('MERGE_PDF', {
                        files: doneFiles.map(f => ({ blob: f.resultBlob }))
                    });
                    pdfBlobUrl = URL.createObjectURL(finalPdfBlob);
                }
            }
            
            isDone = true;
            await tick();
            document.querySelector('.done-frame')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (e) {
            console.error("Error during conversion", e);
        } finally {
            isConverting = false;
        }
    }

    async function downloadAllZip() {
        const doneFiles = files.filter(f => f.status === 'done' && f.resultBlob && f.resultName);
        if (doneFiles.length === 0) return;

        const zip = new JSZip();
        doneFiles.forEach(f => {
            zip.file(f.resultName!, f.resultBlob!);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "converted_images.zip";
        link.click();
        URL.revokeObjectURL(link.href);
    }
</script>

<div class="card">
    <div class="tool-body">
        {#if files.length === 0}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="upload-box" class:drag-over={isDragging} onclick={() => document.getElementById('file-upload-input')?.click()} role="button" tabindex="0" ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <i class="ti ti-photo ico" aria-hidden="true"></i>
                <p class="ttl">{texts['heic_converter.upload.title'] || texts.uploadTitle || ''}</p>
                <p class="sub">{texts['heic_converter.upload.subtitle'] || texts.uploadSubtitle || ''}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); document.getElementById('file-upload-input')?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts['heic_converter.upload.btn_select'] || texts.btnSelect || 'Select Files'}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        fetch('/sample.heic')
                            .then(res => {
                                if (!res.ok) throw new Error('Sample not found');
                                return res.blob();
                            })
                            .then(blob => {
                                files = [...files, { id: crypto.randomUUID(), file: new File([blob], 'sample.heic', { type: "image/heic" }), url: null, status: 'pending', resultUrl: null, resultBlob: null, resultName: null }];
                            })
                            .catch(() => {
                                const emptyBlob = new Blob(["sample"], { type: "image/heic" });
                                files = [...files, { id: crypto.randomUUID(), file: new File([emptyBlob], 'sample.heic', { type: "image/heic" }), url: null, status: 'pending', resultUrl: null, resultBlob: null, resultName: null }];
                            })
                            .finally(() => isLoadingSample = false);
                    }}>
                        {#if isLoadingSample}
                            <i class="ti ti-loader icon-spin" aria-hidden="true"></i>
                        {:else}
                            <i class="ti ti-photo" aria-hidden="true"></i>
                        {/if}
                        {texts['heic_converter.btn.load_sample'] || ""}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts['heic_converter.upload.hint'] || texts.uploadHint || 'Select multiple files'}</p>
                <input type="file" id="file-upload-input" multiple accept=".heic,.heif" class="hidden-el" style="display: none" onchange={onFileSelect} />
            </div>
        {:else if !isDone}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="files-container" class:drag-over={isDragging} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <div class="files-header">
                    <button class="btn-primary btn-sm" onclick={() => document.getElementById('file-upload-input')?.click()}>
                        <i class="ti ti-plus" aria-hidden="true"></i> <span>{texts['heic_converter.btn.add_more'] || 'Add More'}</span>
                    </button>
                    <button class="btn-text" onclick={clearAll}>
                        <i class="ti ti-trash"></i> <span>{texts['heic_converter.btn.clear'] || 'Clear All'}</span>
                    </button>
                    <input type="file" id="file-upload-input" multiple accept=".heic,.heif" style="display: none" onchange={onFileSelect} />
                </div>
                
                <div class="files-list">
                    {#each files as f, i (f.id)}
                        <div class="file-item">
                            <div class="file-info">
                                <i class="ti ti-file" aria-hidden="true"></i>
                                <span class="file-name">{f.file.name}</span>
                            </div>
                            
                            <div class="file-status">
                                {#if f.status === 'pending'}
                                    <span class="status-badge pending">{texts['heic_converter.status.pending'] || 'Pending'}</span>
                                {:else if f.status === 'converting'}
                                    <span class="status-badge converting">
                                        <i class="ti ti-loader icon-spin"></i> {texts['heic_converter.status.converting'] || 'Converting...'}
                                    </span>
                                {:else if f.status === 'done'}
                                    <span class="status-badge done">{texts['heic_converter.status.done'] || 'Done'}</span>
                                {:else if f.status === 'error'}
                                    <span class="status-badge error">{texts['heic_converter.status.error'] || 'Error'}</span>
                                {/if}
                            </div>

                            <div class="file-actions">
                                {#if f.status === 'done' && f.resultUrl && f.resultName}
                                    <a href={f.resultUrl} download={f.resultName} class="btn-icon" title="Download">
                                        <i class="ti ti-download"></i>
                                    </a>
                                {/if}
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="btn-icon btn-remove" onclick={() => removeFile(i)}>
                                    <i class="ti ti-x"></i>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

        {:else}
            {#if outputFormat === 'pdf' && pdfBlobUrl}
                <div class="done-frame">
                    <div class="preview-main pdf-preview">
                        <iframe src={pdfBlobUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview"></iframe>
                        <div class="pdf-page-count">
                            {files.length} {texts['heic_converter.pages'] || texts.pages || 'Pages'}
                        </div>
                    </div>
                </div>
            {:else if outputFormat !== 'pdf'}
                {@const doneFiles = files.filter(f => f.status === 'done')}
                <div class="images-container">
                    <div class="images-grid" class:grid-1={doneFiles.length === 1} class:grid-2={doneFiles.length >= 2}>
                        {#each doneFiles as f, i (f.id)}
                            <div class="image-item">
                                <img src={f.resultUrl} alt={f.resultName} />
                                <div class="image-actions">
                                    <span class="badge">{i + 1}</span>
                                    <a href={f.resultUrl} download={f.resultName} class="btn-dl-img" title="Download">
                                        <i class="ti ti-download"></i>
                                    </a>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            
            <hr class="settings-divider mt-4">
            <div class="done-cta">
                {#if outputFormat === 'pdf' && pdfBlobUrl}
                    <a href={pdfBlobUrl} download="converted_images.pdf" class="btn-dl w-full justify-center" style="text-decoration: none;">
                        <i class="ti ti-download" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts['heic_converter.btn.download'] || ""}</span>
                        <span class="cta-mobile hidden-el">{texts['heic_converter.btn.download'] || ""}</span>
                    </a>
                {:else}
                    {#if files.filter(f => f.status === 'done').length > 1}
                        <button class="btn-dl w-full justify-center" onclick={downloadAllZip}>
                            <i class="ti ti-download" aria-hidden="true"></i>
                            <span class="cta-desktop">{texts['heic_converter.btn.download_all'] || ''}</span>
                            <span class="cta-mobile hidden-el">{texts['heic_converter.btn.zip'] || 'ZIP'}</span>
                        </button>
                    {:else if files.filter(f => f.status === 'done').length === 1}
                        {#each files.filter(f => f.status === 'done') as f}
                            <a href={f.resultUrl} download={f.resultName} class="btn-dl w-full justify-center" style="text-decoration: none;">
                                <i class="ti ti-download" aria-hidden="true"></i>
                                <span class="cta-desktop">{texts['heic_converter.btn.download'] || ''}</span>
                                <span class="cta-mobile hidden-el">{texts['heic_converter.btn.download'] || 'Download'}</span>
                            </a>
                        {/each}
                    {/if}
                {/if}
                <button class="btn-default w-full justify-center" onclick={clearAll}>
                    <i class="ti ti-refresh" aria-hidden="true"></i> {texts['heic_converter.btn.convert_new'] || 'Convert New'}
                </button>
            </div>
        {/if}

        {#if !isDone}
            <div class="settings">
                {#if files.length > 0}
                    <div class="setting-row">
                        <div class="setting-lbl">{texts['heic_converter.settings.max_width'] || 'Max Width (0 for original)'}</div>
                        <div class="setting-ctl">
                            <div class="size-row">
                                <form class="size-input-line" onsubmit={(e) => e.preventDefault()}>
                                    <input class="size-input" type="number" min="0" bind:value={maxWidth} oninput={resetFilesState} placeholder="0">
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="setting-row">
                        <div class="setting-lbl">{texts['heic_converter.settings.format'] || 'Output Format'}</div>
                        <div class="setting-ctl">
                            <div class="tag-row">
                                <span class="tag" class:on={outputFormat === 'png'} role="button" tabindex="0" onclick={() => setFormat('png')} onkeydown={(e) => e.key==='Enter' && setFormat('png')}>PNG</span>
                                <span class="tag" class:on={outputFormat === 'jpg'} role="button" tabindex="0" onclick={() => setFormat('jpg')} onkeydown={(e) => e.key==='Enter' && setFormat('jpg')}>JPG</span>
                                <span class="tag" class:on={outputFormat === 'pdf'} role="button" tabindex="0" onclick={() => setFormat('pdf')} onkeydown={(e) => e.key==='Enter' && setFormat('pdf')}>PDF</span>
                            </div>
                        </div>
                    </div>
                    <hr class="settings-divider">
                {/if}
                <button
                    class="btn-cta"
                    onclick={convertAll}
                    disabled={isConverting || files.length === 0 || files.every(f => f.status === 'done' || f.status === 'error')}
                >
                    {#if isConverting}
                        <i class="ti ti-loader icon-spin" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts['heic_converter.btn.converting'] || ''}</span>
                        <span class="cta-mobile hidden-el">{texts['heic_converter.btn.converting'] || ''}</span>
                    {:else}
                        <i class="ti ti-wand" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts['heic_converter.btn.convert'] || ''}</span>
                        <span class="cta-mobile hidden-el">{texts['heic_converter.btn.convert'] || ''}</span>
                    {/if}
                </button>
            </div>
        {/if}
    
        <div class="card-footer">
            <Share title={texts?.['heic_converter.title'] || ''} />
        </div>
    </div>
</div>

<style>
    .card-footer {
        padding: 8px 16px;
    }
    
    .hidden-el {
        display: none !important;
    }

    .upload-box {
        transition: border-color 0.2s, background 0.2s;
    }
    
    .upload-box.drag-over {
        border-color: var(--ac);
        background: rgba(74, 144, 217, 0.05);
    }
    
    .files-container {
        border-radius: var(--r);
        transition: border-color 0.2s, background 0.2s;
    }
    
    .files-container.drag-over {
        border-color: var(--ac);
        background: rgba(74, 144, 217, 0.05);
    }

    .files-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .btn-sm {
        padding: 6px 12px; 
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: var(--r);
    }

    .btn-text {
        background: none;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        color: var(--danger, #ef4444);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        transition: all 0.2s;
    }

    .btn-text:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger, #ef4444);
    }

    .files-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 320px;
        overflow-y: auto;
    }

    .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        background: var(--bg-alt);
        border: 1px solid var(--bd);
        border-radius: var(--r);
    }

    .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        overflow: hidden;
    }
    
    .file-info i {
        font-size: 20px;
        color: var(--text-muted);
    }

    .file-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .file-status {
        margin: 0 16px;
        min-width: 80px;
        text-align: center;
    }

    .status-badge {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: var(--r);
        font-weight: 600;
    }

    .status-badge.pending { background: #f3f4f6; color: #4b5563; }
    .status-badge.converting { background: #e0f2fe; color: #0284c7; }
    .status-badge.done { background: #dcfce3; color: #166534; }
    .status-badge.error { background: #fee2e2; color: #991b1b; }

    .file-actions {
        display: flex;
        gap: 8px;
    }

    .btn-icon {
        background: none;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text);
        text-decoration: none;
        transition: all 0.2s;
    }

    .btn-icon:hover {
        background: var(--bg-hover, #f3f4f6);
    }

    .btn-icon.btn-remove:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger, #ef4444);
        border-color: var(--danger, #ef4444);
    }

    .images-grid {
        display: grid;
        gap: 12px;
        max-height: 350px;
        overflow-y: auto;
        padding-right: 0px;
    }

    .images-grid.grid-1 {
        grid-template-columns: 1fr;
    }

    .images-grid.grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }

    .image-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--r);
        overflow: hidden;
        border: 1px solid var(--bd);
        background: var(--bg-alt);
    }

    .images-grid.grid-1 .image-item {
        aspect-ratio: auto;
        border: none;
        background: transparent;
    }

    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .images-grid.grid-1 .image-item img {
        height: auto;
        max-height: 320px;
        object-fit: contain;
        border: 1px solid var(--bd);
        border-radius: var(--r);
    }

    .image-actions {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 0.2s;
    }

    .image-item:hover .image-actions {
        opacity: 1;
    }

    .badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: var(--ac);
        color: white;
        padding: 2px 8px;
        border-radius: var(--r);
        font-size: 12px;
        font-weight: 600;
    }

    .btn-dl-img {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: var(--r);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-dl-img:hover {
        background: var(--ac);
    }

    .mt-4 { margin-top: 16px; }
    
    .pdf-preview { overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: #e5e7eb; width: 100%; min-height: 400px; border-radius: var(--r); }
    .pdf-iframe { width: 100%; height: 100%; border: none; min-height: 400px; display: block; transition: opacity 0.3s; opacity: 1; }
    .pdf-page-count { position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,0,0,0.6); color: white; font-size: 0.8rem; padding: 4px 10px; border-radius: var(--r); font-weight: 500; backdrop-filter: blur(4px); }
    .justify-center { justify-content: center; }
    .w-full { width: 100%; }

    @media (max-width: 768px) {
        .images-grid.grid-2 {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
        .pdf-preview, .pdf-iframe {
            min-height: 350px;
        }
        .file-status { display: none; }
        
        /* Mobile Settings Layout Override */
        .settings .setting-row {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            align-items: center !important;
        }
        .settings .setting-ctl,
        .settings .size-row {
            width: auto !important;
        }
    }
</style>
