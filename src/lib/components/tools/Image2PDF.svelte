<script lang="ts">
    import { onMount, onDestroy, tick } from "svelte";
    import jsPDF from "jspdf";
    import Sortable from "sortablejs";

    interface Props {
        texts?: any;
        samples?: string[];
    }

    let { texts = {}, samples = [] }: Props = $props();

    let images = $state<{ url: string; file: File; id: string }[]>([]);
    let isDragging = $state(false);

    let pdfBlobUrl = $state<string | null>(null);
    let isGenerating = $state(false);

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function handleFiles(files: FileList | File[]) {
        const newImages = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .map(f => ({
                url: URL.createObjectURL(f),
                file: f,
                id: generateId()
            }));
        images = [...images, ...newImages];
        // Clear preview if images change
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
                const filename = url.split('/').pop() || 'sample.png';
                files.push(new File([blob], filename, { type: blob.type }));
            }
            handleFiles(files);
        } catch (e) {
            console.error("Failed to load sample images", e);
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
        let sortable = new Sortable(node, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;
                if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                    const newImages = [...images];
                    const [movedItem] = newImages.splice(oldIndex, 1);
                    newImages.splice(newIndex, 0, movedItem);
                    images = newImages;
                    pdfBlobUrl = null;
                }
            }
        });

        return {
            destroy() {
                sortable.destroy();
            }
        };
    }

    function removeImage(index: number) {
        URL.revokeObjectURL(images[index].url);
        images = images.filter((_, i) => i !== index);
        pdfBlobUrl = null;
    }

    function clearAll() {
        images.forEach(img => URL.revokeObjectURL(img.url));
        images = [];
        pdfBlobUrl = null;
    }

    async function generatePdf() {
        if (images.length === 0) return;
        isGenerating = true;
        
        try {
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                const imgData = images[i].url;
                
                // Get original dimensions to maintain aspect ratio
                const img = new Image();
                img.src = imgData;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const imgRatio = img.width / img.height;
                const pdfRatio = pdfWidth / pdfHeight;

                let finalWidth, finalHeight;

                if (imgRatio > pdfRatio) {
                    // Image is wider relative to the page
                    finalWidth = pdfWidth;
                    finalHeight = pdfWidth / imgRatio;
                } else {
                    // Image is taller
                    finalHeight = pdfHeight;
                    finalWidth = pdfHeight * imgRatio;
                }

                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;

                pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
            }

            const blob = pdf.output('blob');
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
        images.forEach(img => URL.revokeObjectURL(img.url));
        if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
        }
    });

</script>

<div class="card">
    <div class="tool-body">
        
        {#if images.length === 0}
            <!-- Upload Zone -->
            <div class="upload-box" class:drag-over={isDragging} onclick={() => document.getElementById('img-upload-input')?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle} onkeydown={(e) => e.key === 'Enter' && document.getElementById('img-upload-input')?.click()} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <i class="ti ti-file-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || ""}</p>
                <p class="sub">{texts.uploadSubtitle || ""}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); document.getElementById('img-upload-input')?.click(); }}>
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
            </div>
        {/if}

        <input id="img-upload-input" type="file" multiple accept="image/*" class="hidden-el" style="display: none;" onchange={onFileSelect}>

        {#if images.length > 0}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="images-container" class:drag-over={isDragging} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop}>
                <div class="images-header">
                    <button class="btn-primary btn-sm" onclick={() => document.getElementById('img-upload-input')?.click()}>
                        <i class="ti ti-plus" aria-hidden="true"></i> <span class="hide-mobile">{texts.btnAddMore || ""}</span>
                    </button>
                    <button class="btn-text" onclick={clearAll}>
                        <i class="ti ti-trash"></i> <span class="hide-mobile">{texts.btnClear || ""}</span>
                    </button>
                </div>
                
                <div class="images-grid" use:sortableAction>
                    {#each images as img, i (img.id)}
                        <div class="image-item">
                            <img src={img.url} alt="Uploaded" />
                            <div class="image-actions">
                                <span class="badge">{i + 1}</span>
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="btn-remove" onclick={() => removeImage(i)}>
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
                        <span class="btn-badge">{images.length}</span>
                    {/if}
                </button>
            </div>
        {/if}

        {#if pdfBlobUrl}
            <div class="done-frame mt-4">
                <div class="preview-main pdf-preview">
                    <iframe src={pdfBlobUrl + '#toolbar=0'} class="pdf-iframe" title="PDF Preview"></iframe>
                    <div class="pdf-page-count">
                        {images.length} {texts.pages || ''}
                    </div>
                </div>
            </div>
            
            <hr class="settings-divider mt-4">
            <div class="done-cta">
                <a href={pdfBlobUrl} download="uploadless_png2pdf.pdf" class="btn-dl w-full justify-center" style="text-decoration: none;">
                    <i class="ti ti-download" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnDownload || ""}</span>
                    <span class="cta-mobile hidden-el">{texts.btnDownloadShort || ""}</span>
                </a>
            </div>
        {/if}

    </div>
</div>

<style>

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
        border-radius: 6px;
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
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
    }

    .image-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--bd);
        background: var(--bg-alt);
        cursor: grab;
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
