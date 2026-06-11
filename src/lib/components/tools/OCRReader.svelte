<script lang="ts">
    import { onMount, tick } from "svelte";
    import { page } from "$app/stores";
    import { processImage as processImageV5 } from "$lib/utils/ocrV5Processor";
    import { t } from "$lib/i18n/config";

    interface Props {
        texts?: any;
    }

    let { texts = {} }: Props = $props();
    let dict = $derived($page.data.dict);

    let queue = $state<any[]>([]);
    let isProcessing = $state(false);
    let isLibLoaded = $state(false);
    let fileInput: HTMLInputElement;
    let expandedItemIndex = $state<number>(0);
    let isDragging = $state(false);
    let showImageModal = $state(false);
    let selectedLang = $state('auto');
    let showLangDropdown = $state(false);
    // svelte-ignore non_reactive_update
    let langSelectRef: HTMLDivElement;
    let showReadyLangDropdown = $state(false);
    // svelte-ignore non_reactive_update
    let readyLangSelectRef: HTMLDivElement;
    
    let langOptions = $derived([
        { value: 'auto', label: t('image_to_text.lang.auto', dict) || 'Auto' },
        { value: 'zh', label: t('image_to_text.lang.zh', dict) || 'Chinese' },
        { value: 'ja', label: t('image_to_text.lang.ja', dict) || 'Japanese' },
        { value: 'ko', label: t('image_to_text.lang.ko', dict) || 'Korean' },
        { value: 'th', label: t('image_to_text.lang.th', dict) || 'Thai' },
        { value: 'cyrillic', label: t('image_to_text.lang.cyrillic', dict) || 'Cyrillic' }
    ]);

    async function onLangChange() {
        if (queue.length === 0) return;
        const item = queue[expandedItemIndex];
        if (item) {
            item.status = 'pending';
            item.text = '';
            item.isCleaned = false;
            item.isJoined = false;
            item.lang = selectedLang;
            processAll();
        }
    }

    // Xử lý paste ảnh
    function handlePaste(e: ClipboardEvent) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];
        for (const item of items) {
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    const file = new File([blob], `pasted-${Date.now()}.png`, {
                        type: blob.type,
                    });
                    imageFiles.push(file);
                }
            }
        }
        if (imageFiles.length > 0) {
            handleFiles(imageFiles, undefined, false);
        }
    }

    function onFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            handleFiles(Array.from(input.files), undefined, false);
        }
        // reset file input
        input.value = "";
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
            if (files.length > 0) {
                handleFiles(files, undefined, false);
            }
        }
    }

    async function handleFiles(files: File[], forceLang?: string, isSample = false) {
        if (forceLang) {
            selectedLang = forceLang;
        }
        const newItems = files.map((f) => ({
            file: f,
            text: "",
            prevCleanText: "",
            prevJoinText: "",
            isCleaned: false,
            isJoined: false,
            status: isSample ? "pending" : "ready",
            previewUrl: URL.createObjectURL(f),
            copied: false,
            lang: forceLang || selectedLang,
        }));
        
        const oldLength = queue.length;
        queue = [...queue, ...newItems];
        
        // Luôn focus vào ảnh (đầu tiên của nhóm) vừa được thêm vào
        expandedItemIndex = oldLength;

        if (isSample) {
            processAll();
        }
    }

    async function processAll() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            while (true) {
                const pendingItem = queue.find(item => item.status === "pending");
                if (!pendingItem) break;

                pendingItem.status = "processing";
                // Yield to the browser so the "processing" UI can render before heavy OCR tasks
                await tick();
                await new Promise(r => setTimeout(r, 50));
                
                try {
                    const useLang = pendingItem.lang || selectedLang;
                    let text = await processImageV5(pendingItem.previewUrl, useLang);
                    pendingItem.text = text;
                    pendingItem.status = "done";
                } catch (e) {
                    pendingItem.text = "";
                    pendingItem.status = "error";
                }
            }
        } finally {
            isProcessing = false;
            isLibLoaded = true; // Mark as loaded once any processing is done
        }
    }

    async function startProcessing() {
        const currentLang = queue[expandedItemIndex].lang;
        queue.forEach(item => {
            if (item.status === "ready") {
                item.status = "pending";
                item.lang = currentLang;
            }
        });
        selectedLang = currentLang;
        
        await tick();
        
        processAll();
    }

    async function loadSample(filename = "sample_ocr.jpg", lang?: string) {
        try {
            const response = await fetch(`/${filename}`);
            const blob = await response.blob();
            const file = new File([blob], filename, {
                type: "image/jpeg",
            });
            handleFiles([file], lang, true);
        } catch (e) {
            console.error("Failed to load sample image", e);
        }
    }

    function copyItem(index: number) {
        const item = queue[index];
        navigator.clipboard.writeText(item.text);
        item.copied = true;
        setTimeout(() => (item.copied = false), 2000);
    }

    function removeItem(index: number, e?: MouseEvent) {
        e?.stopPropagation();
        URL.revokeObjectURL(queue[index].previewUrl);
        queue = queue.filter((_, i) => i !== index);
        if (expandedItemIndex >= queue.length) {
            expandedItemIndex = Math.max(0, queue.length - 1);
        }
        if (queue[expandedItemIndex]?.lang) {
            selectedLang = queue[expandedItemIndex].lang;
        }
    }

    const isAllDone = $derived(
        queue.length > 0 && queue.every((item) => item.status === "done" || item.status === "error")
    );

    let copiedAll = $state(false);

    function copyAll() {
        if (!isAllDone) return;
        const allText = queue
            .map((item, index) => `[Image ${index + 1}]\n${item.text || ""}`)
            .join("\n\n");

        navigator.clipboard.writeText(allText);

        copiedAll = true;
        setTimeout(() => (copiedAll = false), 2000);
    }

    function toggleClean(index: number) {
        const item = queue[index];
        if (!item.isCleaned) {
            item.prevCleanText = item.text;
            item.text = item.text.replace(/\s+/g, " ").trim();
            item.isCleaned = true;
        } else {
            item.text = item.prevCleanText;
            item.isCleaned = false;
        }
    }

    function toggleJoin(index: number) {
        const item = queue[index];
        if (!item.isJoined) {
            item.prevJoinText = item.text;
            item.text = item.text.split("\n").map((line: any) => line.trim()).join(" ");
            item.isJoined = true;
        } else {
            item.text = item.prevJoinText;
            item.isJoined = false;
        }
    }

    function handleClickOutside(e: MouseEvent) {
        if (showLangDropdown && langSelectRef && !langSelectRef.contains(e.target as Node)) {
            showLangDropdown = false;
        }
        if (showReadyLangDropdown && readyLangSelectRef && !readyLangSelectRef.contains(e.target as Node)) {
            showReadyLangDropdown = false;
        }
    }

    onMount(() => {
        window.addEventListener("paste", handlePaste);
        window.addEventListener("click", handleClickOutside);
        return () => {
            window.removeEventListener("paste", handlePaste);
            window.removeEventListener("click", handleClickOutside);
            // Cleanup URLs
            queue.forEach(item => URL.revokeObjectURL(item.previewUrl));
        };
    });
</script>

<div class="card ocr-card" class:dragging={isDragging}>
    {#if queue.length === 0}
        <div class="tool-body">
            <div 
                class="upload-box" class:drag-over={isDragging}
                ondragover={(e) => { e.preventDefault(); e.stopPropagation(); isDragging = true; }}
                ondragleave={(e) => { e.preventDefault(); e.stopPropagation(); isDragging = false; }}
                ondrop={onDrop}
                role="button"
                tabindex="0"
                aria-label={texts.uploadTitle || "Drop images here or click to upload"}
                onclick={() => fileInput.click()}
                onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
            >
                <i class="ti ti-file-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || "Drop images here or click to upload"}</p>
                <p class="sub">{texts.uploadSubtitle || "You can also paste images from clipboard."}</p>
                <div class="btn-row">
                    <button class="btn-primary" onclick={(e) => { e.stopPropagation(); fileInput.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || "Select Images"}
                    </button>
                    <button class="btn-default" onclick={(e) => { e.stopPropagation(); loadSample('sample_ocr.jpg', 'zh'); }}>
                        <i class="ti ti-photo" aria-hidden="true"></i> {texts.btnLoadSample || "Load sample"}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.uploadHint}</p>
                <p class="hint hint-mobile">{texts.uploadHint}</p>
            </div>

            <div class="samples-box">
                <p class="samples-title">{texts.trySamples || ""}</p>
                <div class="samples-grid">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="sample-img-btn" onclick={() => loadSample('sample_ocr.jpg', 'zh')}>
                        <img src="/sample_ocr_thumb.jpg" alt="Sample 1" />
                        <div class="sample-overlay"><i class="ti ti-hand-click"></i></div>
                    </button>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="sample-img-btn" onclick={() => loadSample('sample_ocr_2.jpg', 'ja')}>
                        <img src="/sample_ocr_2_thumb.jpg" alt="Sample 2" />
                        <div class="sample-overlay"><i class="ti ti-hand-click"></i></div>
                    </button>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="sample-img-btn" onclick={() => loadSample('sample_ocr_3.jpg', 'auto')}>
                        <img src="/sample_ocr_3_thumb.jpg" alt="Sample 3" />
                        <div class="sample-overlay"><i class="ti ti-hand-click"></i></div>
                    </button>
                </div>
            </div>
        </div>
    {:else}
        <div class="ocr-layout">
            <!-- Sidebar -->
            <div class="ocr-sidebar">
                <div class="sidebar-list">
                    {#each queue as item, idx}
                        <button 
                            class="thumb-item" 
                            class:active={expandedItemIndex === idx}
                            class:error={item.status === "error"}
                            onclick={() => {
                                expandedItemIndex = idx;
                                if (queue[idx].lang) selectedLang = queue[idx].lang;
                            }}
                        >
                            <img src={item.previewUrl} alt="Thumbnail {idx}" />
                            {#if item.status === "processing"}
                                <div class="thumb-overlay">
                                    <i class="ti ti-loader-2 spin" style="font-size: 16px;"></i>
                                </div>
                            {:else if item.status === "done"}
                                <div class="thumb-overlay success">
                                    <i class="ti ti-check" style="font-size: 16px;"></i>
                                </div>
                            {:else if item.status === "error"}
                                <div class="thumb-overlay error">
                                    <i class="ti ti-x" style="font-size: 16px;"></i>
                                </div>
                            {:else if item.status === "ready"}
                                <div class="thumb-overlay ready">
                                    <i class="ti ti-player-play" style="font-size: 16px;"></i>
                                </div>
                            {/if}
                        </button>
                    {/each}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="add-more-btn" onclick={() => fileInput.click()}>
                        <i class="ti ti-plus" style="font-size: 24px;"></i>
                    </button>
                </div>
            </div>

            <!-- Main Area -->
            <div class="ocr-main">
                {#if queue[expandedItemIndex]}
                    {@const activeItem = queue[expandedItemIndex]}
                    <div class="main-content">
                        
                        {#if activeItem.status === "ready"}
                            <div class="processing-view">
                                <div class="image-wrapper">
                                    <img src={activeItem.previewUrl} alt="Preview" />
                                </div>
                                <div class="ready-overlay">
                                    <div class="ready-box">
                                        <p class="lang-info">
                                            {t('image_to_text.ready.info', dict) || ""}
                                        </p>
                                        <div class="lang-select-group">
                                            <div class="custom-select-wrapper" style="width: 100%;" bind:this={readyLangSelectRef}>
                                                <button class="custom-select-btn" style="width: 100%; justify-content: space-between; padding: 6px 12px; font-size: 14px; background: var(--bg-alt);" onclick={(e) => { e.stopPropagation(); showReadyLangDropdown = !showReadyLangDropdown; }}>
                                                    <span>{langOptions.find(o => o.value === activeItem.lang)?.label || t('image_to_text.lang.auto', dict) || 'Auto'}</span>
                                                    <i class="ti ti-chevron-down"></i>
                                                </button>
                                                {#if showReadyLangDropdown}
                                                    <div class="custom-select-dropdown" style="width: 100%;">
                                                        {#each langOptions as opt}
                                                            <button 
                                                                class="custom-select-option" 
                                                                class:active={activeItem.lang === opt.value}
                                                                onclick={() => { activeItem.lang = opt.value; showReadyLangDropdown = false; }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        {/each}
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                        <button class="btn-primary start-btn" onclick={() => startProcessing()}>
                                            <i class="ti ti-player-play"></i> {t('image_to_text.btn.start', dict) || ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {:else if activeItem.status === "processing" || activeItem.status === "pending"}
                            <div class="processing-view">
                                <div class="image-wrapper">
                                    <img src={activeItem.previewUrl} alt="Preview" />
                                </div>
                                <div class="processing-overlay">
                                    <i class="ti ti-loader-2 spin" style="font-size: 32px; color: var(--ac);"></i>
                                    <span>{t('image_to_text.status.processing', dict) || texts.statusProcessing || "Processing..."}</span>
                                </div>
                            </div>
                        {:else if activeItem.status === "done" || activeItem.status === "error"}
                            <div class="preview-section desktop-only">
                                <img src={activeItem.previewUrl} alt="Preview" />
                            </div>
                            <div class="result-section">
                                <div class="result-toolbar">
                                    <div class="custom-select-wrapper" bind:this={langSelectRef}>
                                        <button class="custom-select-btn" onclick={(e) => { e.stopPropagation(); showLangDropdown = !showLangDropdown; }} title={texts.btnSelectLang || "Select Language"}>
                                            <span>{langOptions.find(o => o.value === selectedLang)?.label || t('image_to_text.lang.auto', dict) || 'Auto'}</span>
                                            <i class="ti ti-chevron-down" style="font-size: 14px;"></i>
                                        </button>
                                        {#if showLangDropdown}
                                            <div class="custom-select-dropdown">
                                                {#each langOptions as opt}
                                                    <button 
                                                        class="custom-select-option" 
                                                        class:active={selectedLang === opt.value}
                                                        onclick={() => { selectedLang = opt.value; showLangDropdown = false; onLangChange(); }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="divider"></div>
                                    <button class="tool-btn" onclick={() => showImageModal = true} title={texts.btnViewImage || "View Image"}>
                                        <i class="ti ti-photo" style="font-size: 18px; color: var(--ac);"></i>
                                    </button>
                                    <div class="divider"></div>
                                    <!-- <button class="tool-btn" class:active={activeItem.isCleaned} onclick={() => toggleClean(expandedItemIndex)} title={texts.btnClean || "Clean format"}>
                                        <i class="ti ti-wand" style="font-size: 16px;"></i>
                                    </button> -->
                                    <button class="tool-btn" class:active={activeItem.isJoined} onclick={() => toggleJoin(expandedItemIndex)} title={texts.btnJoin || "Join lines"}>
                                        <i class="ti ti-align-justified" style="font-size: 16px;"></i>
                                    </button>
                                    <button class="tool-btn" onclick={(e) => removeItem(expandedItemIndex, e)} title={t('image_to_text.btn.remove', dict) || "Remove Image"}>
                                        <i class="ti ti-trash" style="font-size: 16px; color: #e74c3c;"></i>
                                    </button>
                                    <div class="spacer"></div>
                                    <button class="tool-btn" onclick={() => copyItem(expandedItemIndex)} title={texts.btnCopy || "Copy Text"}>
                                        {#if activeItem.copied}
                                            <i class="ti ti-check" style="font-size: 16px; color: #2ecc71;"></i>
                                        {:else}
                                            <i class="ti ti-copy" style="font-size: 16px;"></i>
                                        {/if}
                                    </button>
                                </div>
                                <textarea class="result-text" bind:value={activeItem.text}></textarea>
                            </div>
                        {/if}

                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

{#if showImageModal && queue[expandedItemIndex]}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="image-modal-overlay" onclick={() => showImageModal = false}>
        <div class="image-modal-content" onclick={(e) => e.stopPropagation()}>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button class="modal-close-btn" onclick={() => showImageModal = false}>
                <i class="ti ti-x"></i>
            </button>
            <img src={queue[expandedItemIndex].previewUrl} alt="Preview" />
        </div>
    </div>
{/if}

<input
    type="file"
    accept="image/*"
    multiple
    bind:this={fileInput}
    onchange={onFileSelect}
    style="display: none;"
/>

<style>
    .card.ocr-card {
        padding: 0;
        overflow: visible;
        border-radius: 8px; /* low radius as requested */
        border: 1px solid var(--bd);
        background: var(--bg);
        transition: border-color 0.2s;
    }

    .card.ocr-card.dragging {
        border-color: var(--ac);
        background: rgba(74, 144, 217, 0.05); /* Blue tint */
    }

    /* Removed custom empty state styles to use global upload-box */

    .samples-box {
        margin-top: 10px;
        padding: 0;
        text-align: center;
    }

    .samples-title {
        font-size: 13px;
        color: var(--tx-lt);
        margin-bottom: 10px;
        font-style: italic;
    }

    .samples-grid {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .sample-img-btn {
        position: relative;
        height: 80px;
        width: 120px;
        border: 2px solid var(--bd-lt);
        border-radius: 8px;
        padding: 0;
        background: var(--bg);
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s ease;
    }

    .sample-img-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        display: block;
        transition: transform 0.3s ease;
    }

    .sample-img-btn:hover {
        border-color: var(--ac);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sample-img-btn:hover img {
        transform: scale(1.05);
    }

    .sample-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .sample-img-btn:hover .sample-overlay {
        opacity: 1;
    }

    .ocr-layout {
        display: flex;
        min-height: 400px;
        max-height: 400px;
        border-radius: inherit;
    }

    .ocr-sidebar {
        width: 60px;
        border-right: 1px solid var(--bd-lt);
        background: var(--bg-alt);
        overflow-y: auto;
        padding: 12px;
        flex-shrink: 0;
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .sidebar-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
    }

    .thumb-item {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 6px;
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        background: var(--bg);
        padding: 0;
        transition: border-color 0.2s;
    }

    .thumb-item.active {
        border-color: var(--ac);
    }

    .thumb-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .thumb-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .thumb-overlay.success {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
    }

    .thumb-item.error.active {
        border-color: #e74c3c;
    }

    .thumb-overlay.error {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
    }

    .add-more-btn {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        border: 1px dashed var(--ac);
        background: transparent;
        color: var(--ac);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .add-more-btn:hover {
        background: rgba(74, 144, 217, 0.1);
    }

    .ocr-main {
        flex: 1;
        background: var(--bg);
        display: flex;
        flex-direction: column;
        overflow: visible;
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .main-content {
        display: flex;
        flex: 1;
        overflow: visible;
    }

    .processing-view {
        flex: 1;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        overflow: visible;
        height: 400px;
        position: relative;
    }

    :global(.dark) .processing-view {
        background: #111;
    }

    .image-wrapper {
        position: relative;
        max-width: 100%;
        max-height: 100%;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
    }

    .image-wrapper img {
        display: block;
        max-width: 100%;
        max-height: 480px;
        object-fit: contain;
    }

    .processing-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255,255,255,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: var(--ac);
        font-weight: 500;
    }

    :global(.dark) .processing-overlay {
        background: rgba(0,0,0,0.7);
    }

    .result-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--bg);
    }

    .result-toolbar {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        border-bottom: 1px solid var(--bd-lt);
        background: var(--bg-alt);
        gap: 8px;
    }

    .tool-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--tx-lt);
        cursor: pointer;
        transition: all 0.2s;
    }

    .tool-btn:hover {
        background: var(--bg);
        border-color: var(--bd);
        color: var(--tx);
    }

    .tool-btn.active {
        background: rgba(74, 144, 217, 0.1);
        color: var(--ac);
        border-color: rgba(74, 144, 217, 0.3);
    }

    .divider {
        width: 1px;
        height: 24px;
        background: var(--bd-lt);
        margin: 0 4px;
    }

    .spacer {
        flex: 1;
    }

    .custom-select-wrapper {
        position: relative;
    }

    .custom-select-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid var(--bd);
        background: var(--bg);
        color: var(--tx);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .custom-select-btn:hover {
        border-color: var(--ac);
    }

    .custom-select-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 150px;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: flex;
        flex-direction: column;
        padding: 4px;
    }

    .custom-select-option {
        padding: 6px 12px;
        text-align: left;
        background: transparent;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        color: var(--tx);
        cursor: pointer;
        transition: background 0.2s;
    }

    .custom-select-option:hover {
        background: var(--bg-alt);
    }

    .custom-select-option.active {
        background: rgba(74, 144, 217, 0.1);
        color: var(--ac);
        font-weight: 500;
    }

    .result-text {
        flex: 1;
        border: none;
        padding: 12px;
        resize: none;
        outline: none;
        font-size: 14px;
        line-height: 1.6;
        color: var(--tx);
        background: transparent;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        100% { transform: rotate(360deg); }
    }

    .image-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        animation: fadeIn 0.2s ease-out;
    }

    .image-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        background: var(--bg);
        border-radius: 8px;
        padding: 3px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-modal-content img {
        max-width: 100%;
        max-height: calc(90vh - 16px);
        object-fit: contain;
        display: block;
        border-radius: 4px;
    }

    .modal-close-btn {
        position: absolute;
        top: -10px;
        right: -11px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: white;
        color: #333;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
        z-index: 10;
    }

    .modal-close-btn:hover {
        transform: scale(1.1);
        background: #e74c3c;
        color: white;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .upload-box {
        min-height: 250px;
    }

    .preview-section {
        width: 35%;
        max-width: 300px;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        border-right: 1px solid var(--bd-lt);
    }

    :global(.dark) .preview-section {
        background: #111;
    }

    .preview-section img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .ready-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
    }

    .ready-box {
        background: var(--bg);
        padding: 24px;
        border-radius: 8px;
        max-width: 350px;
        width: 100%;
        max-height: 100%;
        overflow: visible;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }

    .lang-info {
        font-size: 14px;
        color: var(--tx);
        line-height: 1.5;
        margin: 0;
    }

    .lang-select-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
    }

    /* .lang-select-group label {
        font-size: 13px;
        color: var(--tx-lt);
        font-weight: 500;
    }

    .native-select {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--bd);
        background: var(--bg-alt);
        color: var(--tx);
        font-size: 14px;
        outline: none;
    }

    .native-select:focus {
        border-color: var(--ac);
    } */

    .start-btn {
        margin-top: 0px;
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 6px 12px;
        font-size: 15px;
    }

    @media (max-width: 768px) {
        .desktop-only {
            display: none !important;
        }
        .samples-box {
            display: none;
        }
        .ocr-layout {
            flex-direction: column;
            max-height: none;
            height: auto;
        }
        .ocr-sidebar {
            width: 100%;
            border-right: none;
            border-top: 1px solid var(--bd-lt);
            order: 2;
            overflow-y: hidden;
            overflow-x: auto;
            padding: 12px;
        }
        .sidebar-list {
            flex-direction: row;
            justify-content: flex-start;
        }
        .ocr-main {
            order: 1;
            flex: 1 1 auto;
        }
        .main-content {
            flex-direction: column;
        }
        .result-section {
            flex: 1 1 auto;
            min-height: 250px;
        }
        .custom-select-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 300px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3), 0 0 0 10000px rgba(0,0,0,0.5);
            border-radius: 12px;
            z-index: 9999;
            padding: 8px;
        }
        .custom-select-option {
            padding: 14px;
            font-size: 16px;
            text-align: center;
            border-bottom: 1px solid var(--bd-lt);
        }
        .custom-select-option:last-child {
            border-bottom: none;
        }
    }
</style>
