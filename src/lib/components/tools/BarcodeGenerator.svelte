<script lang="ts">
    import { onMount } from "svelte";
    import JsBarcode from "jsbarcode";
    import QRCode from "qrcode";
    import JSZip from "jszip";

    interface Props {
        texts?: any;
        barcodeTypes?: { value: string; label: string }[];
        initialType?: string;
    }

    let {
        texts = {},
        barcodeTypes = [
            { value: "code128", label: "Code 128" },
            { value: "qrcode", label: "QR Code" },
            { value: "ean13", label: "EAN-13 / JAN" },
            { value: "ean8", label: "EAN-8" },
            { value: "upca", label: "UPC-A" },
            { value: "itf14", label: "ITF-14" },
        ],
        initialType,
    }: Props = $props();

    let status = $state<"idle" | "proc" | "done">("idle");
    let content = $state("");
    let selectedType = $state(initialType || barcodeTypes[0].value);
    let scale = $state(3);
    let includeText = $state(true);
    let outputFormat = $state<"png" | "svg">("png");
    let hasError = $state(false);
    let errorLines = $state<string[]>([]);

    let results = $state<{ text: string; dataUrl: string; isSvg: boolean }[]>(
        [],
    );
    let progress = $state(0);

    let isTypeDropdownOpen = $state(false);
    function toggleTypeDropdown() {
        isTypeDropdownOpen = !isTypeDropdownOpen;
    }
    function selectType(val: string) {
        selectedType = val;
        isTypeDropdownOpen = false;
    }

    let typeDropdownRef: HTMLDivElement | null = null;
    onMount(() => {
        function handleClickOutside(e: MouseEvent) {
            if (typeDropdownRef && !typeDropdownRef.contains(e.target as Node)) {
                isTypeDropdownOpen = false;
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    async function generateBarcodes() {
        if (!content.trim()) return;
        hasError = false;
        errorLines = [];
        status = "proc";
        progress = 0;

        const lines = content
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        const newResults = [];
        const failedLines: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            try {
                if (selectedType === "qrcode") {
                    const qrOpts = {
                        margin: 2,
                        scale: scale * 2 + 2,
                        color: {
                            dark: "#000000",
                            light: "#FFFFFF"
                        }
                    };

                    if (outputFormat === "svg") {
                        const svgString = await QRCode.toString(line, { ...qrOpts, type: "svg" });
                        const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
                        newResults.push({
                            text: line,
                            dataUrl: svgDataUrl,
                            isSvg: true,
                        });
                    } else {
                        const canvas = document.createElement("canvas");
                        await QRCode.toCanvas(canvas, line, qrOpts);
                        newResults.push({
                            text: line,
                            dataUrl: canvas.toDataURL("image/png"),
                            isSvg: false,
                        });
                    }
                } else {
                    let format = selectedType.toUpperCase();
                    if (format === "UPCA") format = "UPC";
                    
                    const jsBarcodeOpts = {
                        format: format,
                        displayValue: includeText,
                        background: "#FFFFFF",
                        lineColor: "#000000",
                        width: scale,
                        height: scale * 25,
                        margin: 10,
                        textMargin: 6,
                        fontOptions: "bold"
                    };

                    if (outputFormat === "svg") {
                        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        JsBarcode(svgNode, line, jsBarcodeOpts);
                        const serializer = new XMLSerializer();
                        const svgString = serializer.serializeToString(svgNode);
                        const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
                        newResults.push({
                            text: line,
                            dataUrl: svgDataUrl,
                            isSvg: true,
                        });
                    } else {
                        const canvas = document.createElement("canvas");
                        JsBarcode(canvas, line, jsBarcodeOpts);
                        newResults.push({
                            text: line,
                            dataUrl: canvas.toDataURL("image/png"),
                            isSvg: false,
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to generate barcode for:", line, err);
                failedLines.push(line);
            }

            progress = Math.round(((i + 1) / lines.length) * 100);
            if (lines.length > 10) await new Promise((r) => setTimeout(r, 10));
        }

        // If ALL lines failed → show error, stay on idle
        if (newResults.length === 0 && failedLines.length > 0) {
            hasError = true;
            errorLines = failedLines;
            status = "idle";
            return;
        }

        results = newResults;
        status = "done";
    }

    function getFilename(item: { text: string; isSvg: boolean }) {
        const ext = item.isSvg ? "svg" : "png";
        return `${item.text.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${selectedType}.${ext}`;
    }

    function downloadItem(item: {
        text: string;
        dataUrl: string;
        isSvg: boolean;
    }) {
        const a = document.createElement("a");
        a.href = item.dataUrl;
        a.download = getFilename(item);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async function downloadZip() {
        if (results.length === 0) return;

        const zip = new JSZip();

        for (const item of results) {
            const filename = getFilename(item);
            const base64Data = item.dataUrl.split(",")[1];
            zip.file(filename, base64Data, { base64: true });
        }

        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `barcodes_${selectedType}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    function reset() {
        status = "idle";
        results = [];
    }
</script>

<div class="card">
    <div class="tool-body">
        {#if status === "idle"}
            <div class="input-frame" style="margin-bottom: 24px;">
                <textarea
                    bind:value={content}
                    placeholder={texts.contentPlaceholder ||
                        "Enter barcode content, one per line..."}
                    rows="6"
                    class="content-textarea"
                    class:error={hasError}
                    oninput={() => {
                        hasError = false;
                        errorLines = [];
                    }}
                ></textarea>
            </div>

            <div class="settings">
                <div class="setting-row format-row" class:single-option={false}>
                    <div
                        class="setting-lbl"
                        style="margin-bottom: 0; white-space: nowrap;"
                    >
                        {texts.typeLbl || "Barcode Type"}
                    </div>
                    <div class="select-wrap" bind:this={typeDropdownRef} style="position: relative;">
                        <div 
                            class="custom-select-trigger" 
                            onclick={toggleTypeDropdown} 
                            onkeydown={(e) => e.key === 'Enter' && toggleTypeDropdown()} 
                            tabindex="0" 
                            role="button"
                        >
                            <span>{barcodeTypes.find(t => t.value === selectedType)?.label || selectedType}</span>
                            <i class="ti ti-chevron-down" style="transition: transform 0.2s; transform: {isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)'};"></i>
                        </div>
                        {#if isTypeDropdownOpen}
                            <div class="custom-select-dropdown">
                                {#each barcodeTypes as type}
                                    <div 
                                        class="custom-select-option" 
                                        class:selected={selectedType === type.value}
                                        onclick={() => selectType(type.value)}
                                        onkeydown={(e) => e.key === 'Enter' && selectType(type.value)}
                                        tabindex="0"
                                        role="button"
                                    >
                                        {type.label}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-lbl">
                        {texts.scaleLbl || "Size (Scale)"}
                    </div>
                    <div class="format-tags">
                        {#each [1, 2, 3, 4] as s}
                            <span
                                class="tag"
                                class:on={scale === s}
                                role="button"
                                tabindex="0"
                                onclick={() => (scale = s)}
                                onkeydown={(e) =>
                                    e.key === "Enter" && (scale = s)}
                            >
                                {s}x
                            </span>
                        {/each}
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-lbl">
                        {texts.labelLbl || "Show Label"}
                    </div>
                    <div class="format-tags">
                        <span
                            class="tag"
                            class:on={includeText === true}
                            role="button"
                            tabindex="0"
                            onclick={() => (includeText = true)}
                            onkeydown={(e) =>
                                e.key === "Enter" && (includeText = true)}
                        >
                            {texts.yes || "Yes"}
                        </span>
                        <span
                            class="tag"
                            class:on={includeText === false}
                            role="button"
                            tabindex="0"
                            onclick={() => (includeText = false)}
                            onkeydown={(e) =>
                                e.key === "Enter" && (includeText = false)}
                        >
                            {texts.no || "No"}
                        </span>
                    </div>
                </div>

                <div class="setting-row">
                    <div class="setting-lbl">
                        {texts.formatLbl || "Output Format"}
                    </div>
                    <div class="format-tags">
                        <span
                            class="tag"
                            class:on={outputFormat === "png"}
                            role="button"
                            tabindex="0"
                            onclick={() => (outputFormat = "png")}
                            onkeydown={(e) =>
                                e.key === "Enter" && (outputFormat = "png")}
                        >
                            PNG
                        </span>
                        <span
                            class="tag"
                            class:on={outputFormat === "svg"}
                            role="button"
                            tabindex="0"
                            onclick={() => (outputFormat = "svg")}
                            onkeydown={(e) =>
                                e.key === "Enter" && (outputFormat = "svg")}
                        >
                            SVG
                        </span>
                    </div>
                </div>

                <hr class="settings-divider" />
                <button
                    class="btn-cta"
                    onclick={generateBarcodes}
                    disabled={!content.trim()}
                >
                    <i class="ti ti-barcode" aria-hidden="true"></i>
                    <span class="cta-desktop"
                        >{texts.btnGenerate || "Generate Barcodes"}</span
                    >
                    <span class="cta-mobile" style="display:none"
                        >{texts.btnGenerate || "Generate Barcodes"}</span
                    >
                </button>
            </div>
        {/if}

        {#if status === "proc"}
            <div
                class="preview-frame"
                style="padding: 40px; display: flex; align-items: center; justify-content: center;"
            >
                <span
                    class="spin"
                    aria-hidden="true"
                    style="font-size: 32px; color: rgba(255,255,255,0.5);"
                    ><i class="ti ti-loader-2"></i></span
                >
            </div>

            <div class="settings">
                <hr class="settings-divider" />
                <button
                    class="btn-cta"
                    disabled
                    style="background: linear-gradient(to right, var(--ac) {progress}%, #bccfe0 {progress}%); color: #fff; border-color: transparent;"
                >
                    <span class="spin" aria-hidden="true"
                        ><i class="ti ti-loader-2"></i></span
                    >
                    <span class="cta-desktop">{progress}% — Generating...</span>
                    <span class="cta-mobile" style="display:none"
                        >{progress}% — Generating...</span
                    >
                </button>
            </div>
        {/if}

        {#if status === "done"}
            <!-- Barcode grid (scrollable, min-height) -->
            <div class="results-scroll-wrap">
                <div class="results-grid" class:single={results.length === 1}>
                    {#each results as item}
                        <div class="barcode-card">
                            <div class="barcode-img-wrap">
                                <img
                                    src={item.dataUrl}
                                    alt={item.text}
                                    class="barcode-img"
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Action bar at the bottom — same pattern as video component -->
            <div class="settings">
                <hr class="settings-divider" />
                {#if results.length > 1}
                    <button class="btn-dl" onclick={downloadZip}>
                        <i class="ti ti-folder-down" aria-hidden="true"></i>
                        {texts.btnDownloadZip || "Download ZIP"}
                    </button>
                {:else}
                    <button
                        class="btn-dl"
                        onclick={() => downloadItem(results[0])}
                    >
                        <i class="ti ti-download" aria-hidden="true"></i>
                        {texts.btnDownload || "Download"}
                    </button>
                {/if}
                <button
                    class="btn-default"
                    style="width:100%;justify-content:center;margin-top:8px;"
                    onclick={reset}
                >
                    <i class="ti ti-refresh" aria-hidden="true"></i>
                     {texts.btnGenNew || "Generate new barcodes"}
                    
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .content-textarea {
        width: 100%;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid var(--bd);
        background: var(--bg);
        color: var(--tx);
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
        box-sizing: border-box;
        outline: none;
    }
    .content-textarea:focus {
        border-color: var(--ac);
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
    }
    .content-textarea.error {
        border-color: #e05252;
        box-shadow: 0 0 0 3px rgba(224, 82, 82, 0.12);
    }
    .select-wrap {
        flex: 1;
        min-width: 0;
    }
    .custom-select-trigger {
        width: 100%;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid var(--bd);
        background: var(--bg);
        color: var(--tx);
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }
    .custom-select-trigger:hover, .custom-select-trigger:focus {
        border-color: var(--ac);
        outline: none;
    }
    .custom-select-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10;
        max-height: 200px;
        overflow-y: auto;
    }
    .custom-select-option {
        padding: 6px 12px;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
        color: var(--tx);
    }
    .custom-select-option:hover, .custom-select-option:focus {
        background: rgba(74, 144, 217, 0.08);
        outline: none;
    }
    .custom-select-option.selected {
        background: var(--ac);
        color: #fff;
    }
    .format-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    /* ── Scroll wrapper ── */
    .results-scroll-wrap {
        max-height: 320px;
        min-height: 320px;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--bd) transparent;
        padding: 4px 2px 4px 0;
    }
    .results-scroll-wrap::-webkit-scrollbar {
        width: 5px;
    }
    .results-scroll-wrap::-webkit-scrollbar-thumb {
        background: var(--bd);
        border-radius: 4px;
    }

    /* ── Barcode grid: multiple → 2 per row ── */
    .results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    /* Single barcode: center it, no size constraints */
    .results-grid.single {
        grid-template-columns: 1fr;
        justify-content: center;
        justify-items: center;
    }

    .barcode-card {
        background: #ffffff;
        border: 1px solid var(--bd-lt);
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        transition:
            box-shadow 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        box-shadow: 0 2px 8px rgba(74, 144, 217, 0.06);
    }

    .barcode-card:hover {
        border-color: var(--ac);
        box-shadow: 0 6px 20px rgba(74, 144, 217, 0.14);
        transform: translateY(-2px);
    }

    /* Multiple barcodes: constrain image height */
    .barcode-img {
        display: block;
        max-width: 100%;
        max-height: 200px;
        width: auto;
        height: auto;
        object-fit: contain;
    }

    /* Single barcode: let it be as large as it wants */
    .results-grid.single .barcode-img {
        max-height: none;
        max-width: 100%;
    }

    @media (max-width: 768px) {
        .results-grid {
            grid-template-columns: 1fr;
        }
        .setting-row {
            flex-direction: row;
            align-items: center;
        }
    }
    .settings {
        border-top: none;
    }
</style>
