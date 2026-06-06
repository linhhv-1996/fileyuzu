<script lang="ts">
    import { onMount } from "svelte";

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
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === "string") {
                if (isListA) {
                    listA = event.target.result;
                } else {
                    listB = event.target.result;
                }
            }
        };
        reader.readAsText(file);
        
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
                        <label class="btn-icon" title="Load from text/csv">
                            <i class="ti ti-upload"></i>
                            <input type="file" accept=".txt,.csv" style="display: none;" onchange={(e) => handleFileUpload(e, true)}>
                        </label>
                    </div>
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
                        <label class="btn-icon" title="Load from text/csv">
                            <i class="ti ti-upload"></i>
                            <input type="file" accept=".txt,.csv" style="display: none;" onchange={(e) => handleFileUpload(e, false)}>
                        </label>
                    </div>
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
</style>
