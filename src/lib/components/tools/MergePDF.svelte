<script lang="ts">
    import Share from '../Share.svelte';
    import { onMount, onDestroy, tick } from "svelte";
    import { adsManager } from "$lib/utils/adsManager";

    // Ads 
    // #7294409-7294413
    const AD_LINKS = [
        'aHR0cHM6Ly9wbHVtcC1wbGFzdGljLmNvbS9iZTNJVi8wV1AuM3pwUXZ4YmxtV1ZwSi9aL0RzMFYzL01Vam9rZzBwTkJEVUFsNS1MaFRDY2t5VE9kVGxRLzAvTS9Ua01h'
    ];

    interface Props {
        texts?: any;
        samples?: string[];
    }

    let { texts = {}, samples = [] }: Props = $props();

    let items = $state<{ url: string; file: File; id: string; type: 'image' | 'pdf' }[]>([]);
    let isDragging = $state(false);

    let pdfBlobUrl = $state<string | null>(null);
    let totalPdfPages = $state(0);
    let isGenerating = $state(false);

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function handleFiles(files: FileList | File[]) {
        const newItems = Array.from(files)
            .filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
            .map(f => {
                let url = URL.createObjectURL(f);
                let type: 'image' | 'pdf' = f.type === 'application/pdf' ? 'pdf' : 'image';
                return {
                    url,
                    file: f,
                    id: generateId(),
                    type
                };
            });
        items = [...items, ...newItems];
        pdfBlobUrl = null;
    }

    function onFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            handleFiles(input.files);
        }
        input.value = "";
    }

    let isSamplesLoading = $state(false);

    async function loadSamples() {
        if (!samples || samples.length === 0) return;
        isSamplesLoading = true;
        try {
            const files: File[] = [];
            for (const url of samples) {
                const response = await fetch(url);
                const blob = await response.blob();
                const filename = url.split('/').pop() || 'sample.jpg';
                files.push(new File([blob], filename, { type: blob.type }));
            }
            handleFiles(files);
        } catch (e) {
            console.error("Failed to load samples", e);
        } finally {
            isSamplesLoading = false;
        }
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

    function sortableAction(node: HTMLElement) {
        let sortable: any;
        
        import("sortablejs").then(module => {
            const Sortable = module.default || module;
            sortable = new Sortable(node, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: (evt: any) => {
                    const { oldIndex, newIndex } = evt;
                    if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                        const newItems = [...items];
                        const [movedItem] = newItems.splice(oldIndex, 1);
                        newItems.splice(newIndex, 0, movedItem);
                        items = newItems;
                        pdfBlobUrl = null;
                    }
                }
            });
        });

        return {
            destroy() {
                if (sortable) sortable.destroy();
            }
        };
    }

    function removeItem(index: number) {
        URL.revokeObjectURL(items[index].url);
        items = items.filter((_, i) => i !== index);
        pdfBlobUrl = null;
    }

    function clearAll() {
        items.forEach(item => URL.revokeObjectURL(item.url));
        items = [];
        pdfBlobUrl = null;
    }

    async function getImageJpegArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(blob => {
                        if (blob) {
                            blob.arrayBuffer().then(resolve).catch(reject);
                        } else {
                            reject(new Error("Canvas to Blob failed"));
                        }
                    }, 'image/jpeg', 0.95);
                } else {
                    reject(new Error("Canvas 2D context not available"));
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Image load failed"));
            };
            img.src = url;
        });
    }

    async function generatePdf() {
        if (items.length === 0) return;
        isGenerating = true;
        
        try {
            const { PDFDocument } = await import("pdf-lib");
            const mergedPdf = await PDFDocument.create();

            for (const item of items) {
                if (item.type === 'pdf') {
                    const arrayBuffer = await item.file.arrayBuffer();
                    const srcDoc = await PDFDocument.load(arrayBuffer);
                    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                } else if (item.type === 'image') {
                    const jpegBuffer = await getImageJpegArrayBuffer(item.file);
                    const image = await mergedPdf.embedJpg(jpegBuffer);
                    const page = mergedPdf.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                }
            }

            totalPdfPages = mergedPdf.getPageCount();

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
            pdfBlobUrl = URL.createObjectURL(blob);
            
            await tick();
            document.querySelector('.done-frame')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            isGenerating = false;
        }
    }

    onDestroy(() => {
        items.forEach(item => URL.revokeObjectURL(item.url));
        if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
        }
    });

</script>

<div class="card">
    <div class="tool-body">
        
        {#if items.length === 0}
            <!-- Upload Zone -->
            <div class="upload-box" class:drag-over={isDragging} onclick={() => document.getElementById('merge-upload-input')?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle} onkeydown={(e) => e.key === 'Enter' && document.getElementById('merge-upload-input')?.click()} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <i class="ti ti-file-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || ""}</p>
                <p class="sub">{texts.uploadSubtitle || ""}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); document.getElementById('merge-upload-input')?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || ""}
                    </button>
                    {#if samples && samples.length > 0}
                        <button class="btn-default" disabled={isSamplesLoading} onclick={(e) => { e.stopPropagation(); loadSamples(); }}>
                            {#if isSamplesLoading}
                                <i class="ti ti-loader icon-spin" aria-hidden="true"></i>
                            {:else}
                                <i class="ti ti-photo" aria-hidden="true"></i>
                            {/if}
                            {texts.btnLoadSample || ""}
                        </button>
                    {/if}
                </div>
                {#if texts.uploadHint}
                    <p class="hint hint-desktop">{texts.uploadHint}</p>
                    <p class="hint hint-mobile">{texts.uploadHint}</p>
                {/if}
            </div>
            
            <div class="settings">
                <hr class="settings-divider" />
                <button class="btn-cta combine-btn" disabled>
                    <i class="ti ti-layers-linked" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnCombine || ""}</span>
                    <span class="cta-mobile hidden-el">{texts.btnCombine || ""}</span>
                </button>
            </div>
        {/if}

        <input id="merge-upload-input" type="file" multiple accept="image/*,application/pdf" class="hidden-el" style="display: none;" onchange={onFileSelect}>

        {#if items.length > 0}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="images-container" class:drag-over={isDragging} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <div class="images-header">
                    <button class="btn-primary btn-sm" onclick={() => document.getElementById('merge-upload-input')?.click()}>
                        <i class="ti ti-plus" aria-hidden="true"></i> <span class="hide-mobile">{texts.btnAddMore || ""}</span>
                    </button>
                    <button class="btn-text" onclick={clearAll}>
                        <i class="ti ti-trash"></i> <span class="hide-mobile">{texts.btnClear || ""}</span>
                    </button>
                </div>
                
                <div class="images-grid" use:sortableAction>
                    {#each items as item, i (item.id)}
                        <div class="image-item" class:is-pdf={item.type === 'pdf'}>
                            {#if item.type === 'image'}
                                <img src={item.url} alt="Uploaded" />
                            {:else}
                                <div class="pdf-icon">
                                    <i class="ti ti-file-type-pdf"></i>
                                    <div class="pdf-name">{item.file.name}</div>
                                </div>
                            {/if}
                            <div class="image-actions">
                                <span class="badge">{i + 1}</span>
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="btn-remove" onclick={() => removeItem(i)}>
                                    <i class="ti ti-x"></i>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="settings">
                <hr class="settings-divider" />
                <button
                    class="btn-cta combine-btn"
                    onclick={generatePdf}
                    disabled={isGenerating || !!pdfBlobUrl}
                >
                    {#if isGenerating}
                        <i class="ti ti-loader icon-spin" aria-hidden="true"></i>
                        <span>{texts.btnProcessing || ""}</span>
                    {:else}
                        <i class="ti ti-layers-linked" aria-hidden="true"></i>
                        <span class="cta-desktop">{texts.btnCombine || ""}</span>
                        <span class="cta-mobile hidden-el">{texts.btnCombine || ""}</span>
                        <span class="btn-badge">{items.length}</span>
                    {/if}
                </button>
            </div>
        {/if}

        {#if pdfBlobUrl}
            <div class="done-frame mt-4">
                <div class="preview-main pdf-preview">
                    <iframe src={pdfBlobUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview"></iframe>
                    <div class="pdf-page-count">
                        {totalPdfPages} {texts.pages || 'pages'}
                    </div>
                </div>
            </div>
            
            <hr class="settings-divider mt-4">
            <div class="done-cta">
                <a href={pdfBlobUrl} download="uploadless_merged.pdf" class="btn-dl w-full justify-center" style="text-decoration: none;" onclick={() => adsManager.triggerAd(AD_LINKS, 'merge_pdf_download')}>
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload || ""}</span>
                    <span class="cta-mobile hidden-el">{texts.btnDownloadShort || ""}</span>
                </a>
            </div>
        {/if}

    
        <div class="card-footer">
            <Share title={texts?.uploadTitle || ''} />
        </div>
    </div>
</div>

<style>
.card-footer{
    padding: 8px 16px;
}
.upload-box {
    min-height: 260px;
}

.settings {
    border-top: none;
}

    .images-container {
        border-radius: 8px;
        transition: border-color 0.2s, background 0.2s;
    }

    .combine-btn { position: relative; }
    
    .btn-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #353b48;
        color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        padding: 0 4px;
    }

    .images-container.drag-over {
        border: 2px dashed var(--ac);
        background: rgba(74, 144, 217, 0.05);
        padding: 16px;
    }

    .images-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .btn-text {
        background: none;
        border: 1px solid var(--bd);
        border-radius: 3px;
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

    .images-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        max-height: 420px;
        overflow-y: auto;
        padding-right: 4px;
    }

    .image-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 3px;
        overflow: hidden;
        border: 1px solid var(--bd);
        background: var(--bg-alt);
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-item:active {
        cursor: grabbing;
    }

    :global(.sortable-ghost) {
        opacity: 0.5;
        border: 2px dashed var(--ac) !important;
    }

    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .pdf-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--tc-sub);
        padding: 12px;
        text-align: center;
    }

    .pdf-icon i {
        font-size: 32px;
        color: #ef4444;
        margin-bottom: 8px;
    }

    .pdf-name {
        font-size: 11px;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .btn-remove {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .btn-remove:hover {
        background: var(--danger, #ef4444);
    }

    .pdf-preview { overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: #e5e7eb; width: 100%; min-height: 400px; }
    .pdf-iframe { width: 100%; height: 100%; border: none; min-height: 400px; display: block; transition: opacity 0.3s; opacity: 1; }
    .pdf-page-count { position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,0,0,0.6); color: white; font-size: 0.8rem; padding: 4px 10px; border-radius: 999px; font-weight: 500; backdrop-filter: blur(4px); }
    .justify-center { justify-content: center; }
    .w-full { width: 100%; }
    .mt-4 { margin-top: 16px; }

    .icon-spin {
        animation: spin 1s linear infinite;
    }

    .btn-sm {
        padding: 6px 12px; 
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    @keyframes spin {
        100% { transform: rotate(360deg); }
    }
    
    .hidden-el { display: none !important; }

    @media (max-width: 768px) {
        .pdf-preview, .pdf-iframe {
            min-height: 350px;
        }

        .images-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .hide-mobile {
            display: none !important;
        }
        
        .images-header {
            gap: 6px;
        }
        
        .btn-sm {
            padding: 8px 8px;
            font-size: 14px;
        }

        .btn-text {
            padding: 8px 8px;
            font-size: 14px;
        }
    }
</style>
