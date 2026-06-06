<script lang="ts">
    import { onMount } from "svelte";
    import * as XLSX from "xlsx";

    interface Props {
        texts?: any;
    }

    let {
        texts = {},
    }: Props = $props();

    let listA = $state("");
    let listB = $state("");
    let status = $state<"idle" | "done">("idle");

    let onlyA = $state<string[]>([]);
    let onlyB = $state<string[]>([]);
    let inBoth = $state<string[]>([]);
    let allUnique = $state<string[]>([]);
    let duplicatesA = $state<string[]>([]);
    let duplicatesB = $state<string[]>([]);

    // Excel / CSV column selection state
    let uploadedFileA = $state<{ data: any[][], columns: string[], hasHeaders: boolean } | null>(null);
    let selectedColumnA = $state<string>("all");

    let uploadedFileB = $state<{ data: any[][], columns: string[], hasHeaders: boolean } | null>(null);
    let selectedColumnB = $state<string>("all");

    function updateListFromExcel(isListA: boolean) {
        const fileState = isListA ? uploadedFileA : uploadedFileB;
        const selectedCol = isListA ? selectedColumnA : selectedColumnB;
        
        if (!fileState) return;

        const actualRows = fileState.hasHeaders ? fileState.data.slice(1) : fileState.data;
        
        let items: string[] = [];
        
        if (selectedCol === "all") {
            for (const row of actualRows) {
                const colCount = fileState.columns.length;
                const rowCells = [];
                for (let i = 0; i < colCount; i++) {
                    const cell = row[i];
                    let cellStr = cell !== undefined && cell !== null ? String(cell).trim() : '';
                    if (cellStr.includes(',')) {
                        cellStr = `"${cellStr}"`;
                    }
                    rowCells.push(cellStr);
                }
                if (rowCells.some(c => c !== '')) {
                    items.push(rowCells.join(','));
                }
            }
        } else {
            const colIdx = parseInt(selectedCol);
            for (const row of actualRows) {
                const cell = row[colIdx];
                if (cell !== undefined && cell !== null) {
                    const str = String(cell).trim();
                    if (str !== '') items.push(str);
                }
            }
        }
        
        if (isListA) {
            listA = items.join('\n');
        } else {
            listB = items.join('\n');
        }
    }

    function compare() {
        const arrA = listA.split('\n').map(l => l.trim().normalize('NFC')).filter(l => l.length > 0);
        const arrB = listB.split('\n').map(l => l.trim().normalize('NFC')).filter(l => l.length > 0);

        const setA = new Set(arrA);
        const setB = new Set(arrB);

        // Duplicates
        const seenA = new Set();
        const dupA = new Set<string>();
        for (const item of arrA) {
            if (seenA.has(item)) dupA.add(item);
            seenA.add(item);
        }

        const seenB = new Set();
        const dupB = new Set<string>();
        for (const item of arrB) {
            if (seenB.has(item)) dupB.add(item);
            seenB.add(item);
        }

        onlyA = Array.from(setA).filter(x => !setB.has(x));
        onlyB = Array.from(setB).filter(x => !setA.has(x));
        inBoth = Array.from(setA).filter(x => setB.has(x));
        allUnique = Array.from(new Set([...arrA, ...arrB]));
        duplicatesA = Array.from(dupA);
        duplicatesB = Array.from(dupB);

        status = "done";
    }

    function reset() {
        status = "idle";
        listA = "";
        listB = "";
        uploadedFileA = null;
        uploadedFileB = null;
    }

    function copyToClipboard(textArray: string[]) {
        navigator.clipboard.writeText(textArray.join('\n')).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function handleFileUpload(e: Event, isListA: boolean) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        
        const file = input.files[0];
        const fileExt = file.name.split('.').pop()?.toLowerCase();

        if (fileExt === 'txt') {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    if (isListA) {
                        listA = event.target.result;
                        uploadedFileA = null;
                    } else {
                        listB = event.target.result;
                        uploadedFileB = null;
                    }
                }
            };
            reader.readAsText(file);
        } else if (fileExt === 'csv' || fileExt === 'xls' || fileExt === 'xlsx') {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    const data = new Uint8Array(event.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length > 0) {
                        let maxCols = 0;
                        for (const row of jsonData) {
                            if (row.length > maxCols) maxCols = row.length;
                        }
                        
                        const headers = jsonData[0] || [];
                        const columns = [];
                        for (let i = 0; i < maxCols; i++) {
                            const h = headers[i];
                            columns.push(h !== undefined && h !== null && h !== '' ? String(h) : `Column ${i + 1}`);
                        }
                        
                        if (isListA) {
                            uploadedFileA = { data: jsonData, columns, hasHeaders: true };
                            selectedColumnA = "all";
                            updateListFromExcel(true);
                        } else {
                            uploadedFileB = { data: jsonData, columns, hasHeaders: true };
                            selectedColumnB = "all";
                            updateListFromExcel(false);
                        }
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        }
        
        status = 'idle';
        
        // Reset input so the same file can be selected again
        input.value = "";
    }

</script>

<div class="card">
    <div class="tool-body">
        <div class="lists-container">
                <div class="input-frame list-frame">
                    <div class="list-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            {texts.listA || "List A"}
                            <span class="count-badge">{listA.split('\n').filter(l => l.trim().length > 0).length}</span>
                        </div>
                        <label class="btn-icon" title="Load from txt/csv/excel">
                            <i class="ti ti-upload"></i>
                            <input type="file" accept=".txt,.csv,.xls,.xlsx" style="display: none;" onchange={(e) => handleFileUpload(e, true)}>
                        </label>
                    </div>
                    {#if uploadedFileA}
                        <div class="file-options">
                            <label class="header-checkbox">
                                <input type="checkbox" bind:checked={uploadedFileA.hasHeaders} onchange={() => updateListFromExcel(true)}>
                                {texts.firstRowIsHeader || "First row is header"}
                            </label>
                            <select bind:value={selectedColumnA} onchange={() => updateListFromExcel(true)} class="column-select-inline">
                                <option value="all">{texts.allColumns || "All Columns"}</option>
                                {#each uploadedFileA.columns as col, i}
                                    <option value={String(i)}>{col}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}
                    <textarea
                        bind:value={listA}
                        oninput={() => status = 'idle'}
                        placeholder={texts.placeholderA || "Paste items for List A here..."}
                        class="content-textarea"
                    ></textarea>
                </div>

                <div class="input-frame list-frame">
                    <div class="list-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            {texts.listB || "List B"}
                            <span class="count-badge">{listB.split('\n').filter(l => l.trim().length > 0).length}</span>
                        </div>
                        <label class="btn-icon" title="Load from txt/csv/excel">
                            <i class="ti ti-upload"></i>
                            <input type="file" accept=".txt,.csv,.xls,.xlsx" style="display: none;" onchange={(e) => handleFileUpload(e, false)}>
                        </label>
                    </div>
                    {#if uploadedFileB}
                        <div class="file-options">
                            <label class="header-checkbox">
                                <input type="checkbox" bind:checked={uploadedFileB.hasHeaders} onchange={() => updateListFromExcel(false)}>
                                {texts.firstRowIsHeader || "First row is header"}
                            </label>
                            <select bind:value={selectedColumnB} onchange={() => updateListFromExcel(false)} class="column-select-inline">
                                <option value="all">{texts.allColumns || "All Columns"}</option>
                                {#each uploadedFileB.columns as col, i}
                                    <option value={String(i)}>{col}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}
                    <textarea
                        bind:value={listB}
                        oninput={() => status = 'idle'}
                        placeholder={texts.placeholderB || "Paste items for List B here..."}
                        class="content-textarea"
                    ></textarea>
                </div>
            </div>

            <div class="settings">
                <hr class="settings-divider" />
                <button
                    class="btn-cta"
                    onclick={compare}
                    disabled={!listA.trim() && !listB.trim()}
                >
                    <i class="ti ti-arrows-exchange" aria-hidden="true"></i>
                    <span class="cta-desktop">{texts.btnCompare || "Compare Lists"}</span>
                    <span class="cta-mobile" style="display:none">{texts.btnCompare || "Compare"}</span>
                </button>
            </div>

        {#if status === "done"}
            <div class="results-stack">
                {#each [
                    { id: 'onlyA', title: texts.onlyA || "Only in A", data: onlyA },
                    { id: 'onlyB', title: texts.onlyB || "Only in B", data: onlyB },
                    { id: 'inBoth', title: texts.inBoth || "In Both", data: inBoth },
                    { id: 'allUnique', title: texts.allUnique || "All Unique", data: allUnique },
                    { id: 'duplicatesA', title: texts.duplicatesA || "Duplicates A", data: duplicatesA },
                    { id: 'duplicatesB', title: texts.duplicatesB || "Duplicates B", data: duplicatesB }
                ] as block}
                    <div class="result-block">
                        <div class="result-header" class:no-border={block.data.length === 0}>
                            <div class="result-title" class:empty={block.data.length === 0}>
                                {block.title}
                                <span class="badge" class:empty={block.data.length === 0}>{block.data.length}</span>
                            </div>
                            {#if block.data.length > 0}
                                <button class="btn-copy-small" onclick={() => copyToClipboard(block.data)}>
                                    <i class="ti ti-copy"></i>
                                    {texts.btnCopy || "Copy"}
                                </button>
                            {/if}
                        </div>
                        {#if block.data.length > 0}
                            <textarea readonly class="result-textarea" value={block.data.join('\n')}></textarea>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>



<style>
    .lists-container {
        display: flex;
        gap: 20px;
        margin-bottom: 24px;
    }

    .list-frame {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .list-header {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--tx);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .count-badge {
        background: var(--bg-alt, #f0f4f8);
        color: var(--tx-light, #6b7280);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: var(--bg-alt, #f0f4f8);
        color: var(--tx-light, #6b7280);
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-icon:hover {
        background: rgba(74, 144, 217, 0.1);
        color: var(--ac);
    }

    .content-textarea {
        flex: 1;
        min-height: 280px;
        width: 100%;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid var(--bd);
        background: var(--bg);
        color: var(--tx);
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        outline: none;
    }

    .content-textarea:focus {
        border-color: var(--ac);
        box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
    }

    /* Results Stack */
    .results-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .result-block {
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 8px;
        overflow: hidden;
    }

    .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--bg-alt, #f8fafc);
        border-bottom: 1px solid var(--bd-lt);
    }

    .result-header.no-border {
        border-bottom: none;
    }

    .result-title {
        font-weight: 600;
        color: var(--tx);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .result-title.empty {
        color: var(--tx-light, #94a3b8);
    }

    .badge {
        background: rgba(74, 144, 217, 0.1);
        color: var(--ac);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .badge.empty {
        background: var(--bd-lt, #e2e8f0);
        color: var(--tx-light, #94a3b8);
    }

    .btn-copy-small {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--ac);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    .btn-copy-small:hover {
        opacity: 0.8;
    }

    .result-textarea {
        width: 100%;
        min-height: 170px;
        padding: 12px 16px;
        border: none;
        background: var(--bg);
        color: var(--tx);
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        outline: none;
        box-sizing: border-box;
    }

    .tool-body {
        padding: 10px;
    }

    .tool-body .lists-container {
        gap: 10px;
        margin-bottom: 0;
    }

    .settings {
        margin-bottom: 12px;
        border-top: none;
    }

    .results-stack {
        gap: 10px;
    }

    @media (max-width: 768px) {
        .lists-container {
            flex-direction: column;
        }
        
        .content-textarea {
            min-height: 150px;
        }
    }

    .file-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        background: var(--bg-alt, #f8fafc);
        border: 1px solid var(--bd, #e2e8f0);
        border-radius: 6px;
    }

    .column-select-inline {
        width: 100%;
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid var(--bd);
        background: var(--bg);
        color: var(--tx);
        font-size: 13px;
        outline: none;
    }

    .column-select-inline:focus {
        border-color: var(--ac);
    }

    .header-checkbox {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--tx-light, #6b7280);
        cursor: pointer;
        white-space: nowrap;
    }
</style>
