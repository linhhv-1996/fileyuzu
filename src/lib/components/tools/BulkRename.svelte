<script lang="ts">
    import Share from '../Share.svelte';
    import { onMount } from "svelte";
    import JSZip from "jszip";

    interface Props {
        texts?: any;
    }

    let { texts = {} }: Props = $props();

    interface FileItem {
        id: string;
        file: File;
        originalName: string;
        newName: string;
        extension: string;
    }

    type RuleType = 'replace' | 'add' | 'remove' | 'format' | 'numbering';

    interface Rule {
        id: string;
        type: RuleType;
        find?: string;
        replaceWith?: string;
        textToAdd?: string;
        addAt?: 'prefix' | 'suffix' | 'index';
        customIndex?: number;
        removeType?: 'text' | 'first_n' | 'last_n' | 'range';
        removeText?: string;
        charsCount?: number;
        startIndex?: number;
        endIndex?: number;
        formatType?: 'lowercase' | 'uppercase' | 'title_case' | 'camel_case';
        startAt?: number;
        incrementBy?: number;
        padding?: number;
        separator?: string;
        position?: 'before' | 'after';
    }

    let files = $state<FileItem[]>([]);
    let rules = $state<Rule[]>([]);
    let status = $state<"idle" | "processing">("idle");
    let isDragging = $state(false);
    let isAddRuleOpen = $state(false);
    let activeDropdown = $state<string | null>(null);
    let isLoadingSample = $state(false);
    let fileInput = $state<HTMLInputElement>();

    function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging = true; }
    function handleDragLeave(e: DragEvent) { e.preventDefault(); isDragging = false; }
    function handleDrop(e: DragEvent) {
        e.preventDefault(); isDragging = false;
        if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    }
    function handleFileInput(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files) addFiles(target.files);
        target.value = "";
    }

    function addFiles(newFiles: FileList | File[]) {
        const newItems: FileItem[] = Array.from(newFiles).map(file => {
            const lastDotIndex = file.name.lastIndexOf('.');
            const hasExtension = lastDotIndex !== -1 && lastDotIndex !== 0;
            const name = hasExtension ? file.name.substring(0, lastDotIndex) : file.name;
            const ext = hasExtension ? file.name.substring(lastDotIndex) : '';
            return {
                id: Math.random().toString(36).substr(2, 9),
                file,
                originalName: file.name,
                newName: name,
                extension: ext
            };
        });
        files = [...files, ...newItems];
        applyRules();
    }

    function removeFile(id: string) { files = files.filter(f => f.id !== id); applyRules(); }
    function clearFiles() { files = []; }

    function addRule(type: RuleType) {
        const newRule: Rule = { id: Math.random().toString(36).substr(2, 9), type };
        if (type === 'replace') { newRule.find = ''; newRule.replaceWith = ''; }
        else if (type === 'add') { newRule.textToAdd = ''; newRule.addAt = 'prefix'; newRule.customIndex = 0; }
        else if (type === 'remove') { newRule.removeType = 'first_n'; newRule.charsCount = 1; newRule.startIndex = 0; newRule.endIndex = 1; newRule.removeText = ''; }
        else if (type === 'format') { newRule.formatType = 'lowercase'; }
        else if (type === 'numbering') { newRule.startAt = 1; newRule.incrementBy = 1; newRule.padding = 3; newRule.separator = '-'; newRule.position = 'after'; }
        rules = [...rules, newRule];
        isAddRuleOpen = false;
        applyRules();
    }

    function removeRule(id: string) { rules = rules.filter(r => r.id !== id); applyRules(); }

    function applyRules() {
        files = files.map((file, fileIndex) => {
            let currentName = file.originalName;
            const lastDotIndex = file.originalName.lastIndexOf('.');
            const hasExtension = lastDotIndex !== -1 && lastDotIndex !== 0;
            let baseName = hasExtension ? file.originalName.substring(0, lastDotIndex) : file.originalName;
            let currentExt = hasExtension ? file.originalName.substring(lastDotIndex) : '';

            for (const rule of rules) {
                if (rule.type === 'replace' && rule.find) {
                    try {
                        const escapedFind = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(escapedFind, 'gi');
                        baseName = baseName.replace(regex, rule.replaceWith || '');
                    } catch (e) { }
                } else if (rule.type === 'add' && rule.textToAdd) {
                    if (rule.addAt === 'prefix') baseName = rule.textToAdd + baseName;
                    else if (rule.addAt === 'suffix') baseName = baseName + rule.textToAdd;
                    else if (rule.addAt === 'index' && rule.customIndex !== undefined) {
                        const idx = Math.min(Math.max(0, rule.customIndex), baseName.length);
                        baseName = baseName.substring(0, idx) + rule.textToAdd + baseName.substring(idx);
                    }
                } else if (rule.type === 'remove') {
                    if (rule.removeType === 'text' && rule.removeText) baseName = baseName.split(rule.removeText).join('');
                    else if (rule.removeType === 'first_n' && rule.charsCount) baseName = baseName.substring(rule.charsCount);
                    else if (rule.removeType === 'last_n' && rule.charsCount) baseName = baseName.substring(0, Math.max(0, baseName.length - rule.charsCount));
                    else if (rule.removeType === 'range' && rule.startIndex !== undefined && rule.endIndex !== undefined) {
                        if (rule.startIndex < rule.endIndex) baseName = baseName.substring(0, rule.startIndex) + baseName.substring(rule.endIndex);
                    }
                } else if (rule.type === 'format') {
                    if (rule.formatType === 'lowercase') baseName = baseName.toLowerCase();
                    else if (rule.formatType === 'uppercase') baseName = baseName.toUpperCase();
                    else if (rule.formatType === 'title_case') baseName = baseName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
                    else if (rule.formatType === 'camel_case') baseName = baseName.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
                        if (+match === 0) return "";
                        return index === 0 ? match.toLowerCase() : match.toUpperCase();
                    });
                } else if (rule.type === 'numbering') {
                    const start = rule.startAt || 1;
                    const step = rule.incrementBy || 1;
                    const num = start + (fileIndex * step);
                    const paddedNum = String(num).padStart(rule.padding || 1, '0');
                    const sep = rule.separator || '';
                    if (rule.position === 'before') baseName = paddedNum + sep + baseName;
                    else baseName = baseName + sep + paddedNum;
                }
            }
            return { ...file, newName: baseName, extension: currentExt };
        });
    }

    async function downloadZIP() {
        if (files.length === 0) return;
        status = "processing";
        try {
            const zip = new JSZip();
            for (const fileItem of files) {
                const fullNewName = fileItem.newName + fileItem.extension;
                zip.file(fullNewName, fileItem.file);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = "renamed_files.zip";
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to generate ZIP", error);
        } finally {
            status = "idle";
        }
    }
</script>

<svelte:window onclick={(e) => {
    if (!(e.target as HTMLElement)?.closest('.dropdown-wrapper')) {
        isAddRuleOpen = false;
    }
    if (!(e.target as HTMLElement)?.closest('.custom-select-wrapper')) {
        activeDropdown = null;
    }
}} />

{#snippet CustomSelect(id: string, value: string, options: {value: string, label: string}[], onChange: (v: string) => void, style: string = "width: 120px;")}
    <div class="custom-select-wrapper" style="position: relative; {style}">
        <button 
            class="size-input" 
            style="width: 100%; display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 4px 10px;"
            onclick={(e) => { e.stopPropagation(); activeDropdown = activeDropdown === id ? null : id; isAddRuleOpen = false; }}
        >
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {options.find(o => o.value === value)?.label || value}
            </span>
            <i class="ti ti-chevron-down" style="transition: transform 0.2s; transform: {activeDropdown === id ? 'rotate(180deg)' : 'rotate(0)'}; font-size: 14px;"></i>
        </button>
        {#if activeDropdown === id}
            <div class="custom-select-dropdown" style="width: 100%;">
                {#each options as opt}
                    <button 
                        class="custom-select-option" 
                        class:active={value === opt.value}
                        onclick={(e) => { e.stopPropagation(); onChange(opt.value); activeDropdown = null; applyRules(); }}
                    >
                        {opt.label}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/snippet}

<div class="card">
    <div class="tool-body">
        {#if files.length === 0}
            <!-- Empty state using standard upload box -->
            <div class="upload-box" class:drag-over={isDragging} onclick={() => fileInput?.click()} role="button" tabindex="0" aria-label={texts.uploadTitle || 'Upload Files'} onkeydown={(e) => e.key === 'Enter' && fileInput?.click()} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}>
                <i class="ti ti-cloud-upload ico" aria-hidden="true"></i>
                <p class="ttl">{texts.uploadTitle || 'Upload Files'}</p>
                <p class="sub">{texts.uploadSubtitle || 'Drag & drop multiple files'}</p>
                <div class="btn-row">
                    <button class="btn-primary btn-download-all" onclick={(e) => { e.stopPropagation(); fileInput?.click(); }}>
                        <i class="ti ti-upload" aria-hidden="true"></i> {texts.btnSelect || 'Select Files'}
                    </button>
                    <button class="btn-default" disabled={isLoadingSample} onclick={(e) => { e.stopPropagation();
                        isLoadingSample = true;
                        addFiles([
                            new File(["sample content"], 'document_1.txt', { type: "text/plain" }),
                            new File(["sample content"], 'document_2.txt', { type: "text/plain" }),
                            new File(["sample content"], 'image_1.png', { type: "image/png" }),
                            new File(["sample content"], 'image_2.png', { type: "image/png" })
                        ]);
                        isLoadingSample = false;
                    }}>
                        {#if isLoadingSample}
                            <span class="spin" aria-hidden="true"><i class="ti ti-loader-2"></i></span> {texts.btnSample || 'Try Sample'}
                        {:else}
                            <i class="ti ti-file" aria-hidden="true"></i> {texts.btnSample || 'Try Sample'}
                        {/if}
                    </button>
                </div>
                <p class="hint hint-desktop">{texts.hint || 'Supports all file types'}</p>
                <p class="hint hint-mobile">{texts.hint || 'Supports all file types'}</p>
                <input type="file" multiple bind:this={fileInput} onchange={handleFileInput} style="display: none;" />
            </div>
        {:else}
            <!-- Header for rules -->
            <div class="section-header">
                <div class="sh-title">{texts.rules || 'Renaming Rules'}</div>
            </div>

            <div class="rules-container">
                <div class="rules-scroll">
                            {#each rules as rule, index (rule.id)}
                    <div class="rule-block">
                        <div class="rule-title">
                            <span class="step-num">{index + 1}</span>
                            <strong>
                                {#if rule.type === 'replace'}{texts.rule_replace || 'Find & Replace'}
                                {:else if rule.type === 'add'}{texts.rule_add || 'Add Text'}
                                {:else if rule.type === 'remove'}{texts.rule_remove || 'Remove Text'}
                                {:else if rule.type === 'format'}{texts.rule_format || 'Change Case'}
                                {:else if rule.type === 'numbering'}{texts.rule_numbering || 'Add Numbering'}
                                {/if}
                            </strong>
                            <button class="btn-rm-rule" onclick={() => removeRule(rule.id)} title={texts.remove_rule || 'Remove Rule'}>
                                <i class="ti ti-x"></i>
                            </button>
                        </div>
                        
                        <div class="rule-body">
                            <div class="setting-row top" style="border: none; padding: 0;">
                                {#if rule.type === 'replace'}
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.find_text || 'Find'}</span>
                                        <input type="text" class="size-input" bind:value={rule.find} oninput={applyRules} style="width: 140px;" placeholder="Text to replace">
                                    </div>
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.replace_with || 'Replace'}</span>
                                        <input type="text" class="size-input" bind:value={rule.replaceWith} oninput={applyRules} style="width: 140px;" placeholder="New text">
                                    </div>
                                
                                {:else if rule.type === 'add'}
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.text_to_add || 'Text'}</span>
                                        <input type="text" class="size-input" bind:value={rule.textToAdd} oninput={applyRules} style="width: 140px;">
                                    </div>
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.add_at || 'Position'}</span>
                                        {@render CustomSelect(
                                            `addAt-${rule.id}`,
                                            rule.addAt || 'prefix',
                                            [
                                                { value: 'prefix', label: texts.prefix || 'Prefix' },
                                                { value: 'suffix', label: texts.suffix || 'Suffix' },
                                                { value: 'index', label: texts.custom_index || 'Index' }
                                            ],
                                            (v) => rule.addAt = v as any,
                                            "width: 120px;"
                                        )}
                                    </div>
                                    {#if rule.addAt === 'index'}
                                        <div class="sr-item">
                                            <input type="number" class="size-input" bind:value={rule.customIndex} oninput={applyRules} style="width: 60px;" min="0">
                                        </div>
                                    {/if}
                                
                                {:else if rule.type === 'remove'}
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.remove_type || 'Remove'}</span>
                                        {@render CustomSelect(
                                            `removeType-${rule.id}`,
                                            rule.removeType || 'first_n',
                                            [
                                                { value: 'first_n', label: texts.remove_first_n || 'First N chars' },
                                                { value: 'last_n', label: texts.remove_last_n || 'Last N chars' },
                                                { value: 'range', label: texts.remove_range || 'Range' },
                                                { value: 'text', label: texts.find_text || 'Exact text' }
                                            ],
                                            (v) => rule.removeType = v as any,
                                            "width: 150px;"
                                        )}
                                    </div>
                                    {#if rule.removeType === 'first_n' || rule.removeType === 'last_n'}
                                        <div class="sr-item">
                                            <span class="setting-lbl">Count</span>
                                            <input type="number" class="size-input" bind:value={rule.charsCount} oninput={applyRules} style="width: 60px;" min="1">
                                        </div>
                                    {:else if rule.removeType === 'range'}
                                        <div class="sr-item">
                                            <span class="setting-lbl">Start</span>
                                            <input type="number" class="size-input" bind:value={rule.startIndex} oninput={applyRules} style="width: 60px;" min="0">
                                        </div>
                                        <div class="sr-item">
                                            <span class="setting-lbl">End</span>
                                            <input type="number" class="size-input" bind:value={rule.endIndex} oninput={applyRules} style="width: 60px;" min="0">
                                        </div>
                                    {:else if rule.removeType === 'text'}
                                        <div class="sr-item">
                                            <input type="text" class="size-input" bind:value={rule.removeText} oninput={applyRules} style="width: 140px;" placeholder="Text to delete">
                                        </div>
                                    {/if}
                                
                                {:else if rule.type === 'format'}
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.format_type || 'Case'}</span>
                                        {@render CustomSelect(
                                            `formatType-${rule.id}`,
                                            rule.formatType || 'lowercase',
                                            [
                                                { value: 'lowercase', label: texts.lowercase || 'lowercase' },
                                                { value: 'uppercase', label: texts.uppercase || 'UPPERCASE' },
                                                { value: 'title_case', label: texts.title_case || 'Title Case' },
                                                { value: 'camel_case', label: texts.camel_case || 'camelCase' }
                                            ],
                                            (v) => rule.formatType = v as any,
                                            "width: 140px;"
                                        )}
                                    </div>
                                    
                                {:else if rule.type === 'numbering'}
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.start_at || 'Start'}</span>
                                        <input type="number" class="size-input" bind:value={rule.startAt} oninput={applyRules} style="width: 60px;">
                                    </div>
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.increment_by || 'Step'}</span>
                                        <input type="number" class="size-input" bind:value={rule.incrementBy} oninput={applyRules} style="width: 60px;">
                                    </div>
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.padding || 'Pad'}</span>
                                        <input type="number" class="size-input" bind:value={rule.padding} oninput={applyRules} style="width: 60px;" min="1" max="10">
                                    </div>
                                    <div class="sr-item">
                                        <span class="setting-lbl">{texts.separator || 'Sep'}</span>
                                        <input type="text" class="size-input" bind:value={rule.separator} oninput={applyRules} style="width: 60px;">
                                    </div>
                                    <div class="sr-item">
                                        {@render CustomSelect(
                                            `position-${rule.id}`,
                                            rule.position || 'before',
                                            [
                                                { value: 'before', label: texts.before_name || 'Before' },
                                                { value: 'after', label: texts.after_name || 'After' }
                                            ],
                                            (v) => rule.position = v as any,
                                            "width: 100px;"
                                        )}
                                    </div>
                                {/if}
                            </div> <!-- closes setting-row -->
                        </div> <!-- closes rule-body -->
                    </div> <!-- closes rule-block -->
                {/each}
                        </div> <!-- closes rules-scroll -->
                    </div> <!-- closes rules-container -->

                <!-- Full Width Add Rule Button -->
                <div class="dropdown-wrapper" style="width: 100%; margin-top: 12px;">
                    <button class="btn-dashed-full" onclick={() => isAddRuleOpen = !isAddRuleOpen}>
                        <i class="ti ti-plus"></i> {texts.add_rule || 'Add Rule'}
                    </button>
                    {#if isAddRuleOpen}
                    <div class="dropdown-menu show" style="width: 100%; top: 100%; margin-top: 6px;">
                        <button onclick={() => addRule('replace')}>{texts.rule_replace || 'Find & Replace'}</button>
                        <button onclick={() => addRule('add')}>{texts.rule_add || 'Add Text'}</button>
                        <button onclick={() => addRule('remove')}>{texts.rule_remove || 'Remove Text'}</button>
                        <button onclick={() => addRule('format')}>{texts.rule_format || 'Change Case'}</button>
                        <button onclick={() => addRule('numbering')}>{texts.rule_numbering || 'Add Numbering'}</button>
                    </div>
                    {/if}
                </div>

            <!-- Preview Header -->
            <div class="section-header mt">
                <div class="sh-title">{texts.preview || 'Preview'} <span style="font-weight: 400; color: var(--tx-sub); font-size: 14px;">({files.length} {texts.files || 'files'})</span></div>
                    <div class="sh-actions">
                        <label class="btn-default">
                            <i class="ti ti-upload"></i> {texts.add_files || 'Add Files'}
                            <input type="file" multiple style="display:none" onchange={handleFileInput}>
                        </label>
                        <button class="btn-default" style="color: #dc3545; border-color: transparent;" onclick={clearFiles}>
                            {texts.clear_all || 'Clear All'}
                        </button>
                    </div>
                </div>

                <div class="table-wrapper">
                <table class="file-table">
                    <thead>
                        <tr>
                            <th>{texts.original_name || 'File Name'}</th>
                            <th style="width: 40px"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each files as fileItem}
                            <tr>
                                <td class="cell-name">
                                    <div class="orig-name">{fileItem.originalName}</div>
                                    {#if fileItem.originalName !== fileItem.newName + fileItem.extension}
                                        <div class="new-name changed-text">
                                            <i class="ti ti-arrow-forward"></i> {fileItem.newName}{fileItem.extension}
                                        </div>
                                    {:else}
                                        <div class="new-name">
                                            <i class="ti ti-arrow-forward" style="color: var(--tx-mt)"></i> {fileItem.newName}{fileItem.extension}
                                        </div>
                                    {/if}
                                </td>
                                <td>
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button class="btn-del-file" onclick={() => removeFile(fileItem.id)}>
                                        <i class="ti ti-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 24px;">
                <button class="btn-cta" onclick={downloadZIP} disabled={status === 'processing'}>
                    {#if status === 'processing'}
                        <i class="ti ti-loader icon-spin"></i> Processing...
                    {:else}
                        <i class="ti ti-download"></i> {texts.download_zip || 'Download ZIP'}
                    {/if}
                </button>
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
    min-height: 250px;
}
    /* Section Headers */
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--bd-lt, #e5e7eb);
    }
    .section-header.mt {
        margin-top: 32px;
    }
    .sh-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--tx);
    }
    .sh-actions {
        display: flex;
        gap: 8px;
    }


    /* Rules Container */
    .rules-container {
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 10;
    }
    
    .rules-scroll {
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: visible;
        padding-right: 4px;
    }

    /* Scrollbar for rules-scroll */
    .rules-scroll::-webkit-scrollbar { width: 6px; }
    .rules-scroll::-webkit-scrollbar-track { background: transparent; }
    .rules-scroll::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 4px; }
    .rules-scroll::-webkit-scrollbar-thumb:hover { background: var(--tx-mt); }

    /* Full Width Dashed Button */
    .btn-dashed-full {
        width: 100%;
        padding: 12px;
        background: transparent;
        border: 2px dashed var(--bd);
        border-radius: var(--r);
        color: var(--tx-sub);
        font-size: 14.5px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        font-family: var(--font);
    }
    .btn-dashed-full:hover {
        border-color: var(--ac);
        color: var(--ac);
        background: var(--bg-sub);
    }

    /* Individual Rule Block */
    .rule-block {
        flex-shrink: 0;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        background: var(--bg-sub);
    }
    .rule-title {
        display: flex;
        align-items: center;
        background: #eef2f6; /* slight blueish tint for rule header */
        padding: 8px 16px;
        border-bottom: 1px solid var(--bd-lt);
        font-size: 14px;
        color: var(--tx);
        border-top-left-radius: var(--r);
        border-top-right-radius: var(--r);
    }
    .rule-body {
        padding: 12px 16px;
        background: var(--bg);
        border-bottom-left-radius: var(--r);
        border-bottom-right-radius: var(--r);
    }
    .step-num {
        background: var(--ac);
        color: #fff;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        margin-right: 8px;
    }
    .btn-rm-rule {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--tx-mt);
        cursor: pointer;
        font-size: 14px;
        padding: 2px;
        border-radius: 3px;
    }
    .btn-rm-rule:hover {
        color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
    }

    .sr-item {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-right: 16px;
        margin-bottom: 4px;
        margin-top: 4px;
    }
    
    /* Table */
    .table-wrapper {
        border: 1px solid var(--bd);
        border-radius: var(--r);
        overflow-x: auto;
        max-height: 500px;
    }
    .file-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
        text-align: left;
    }
    .file-table th {
        background: var(--bg-sub);
        padding: 10px 16px;
        font-weight: 500;
        color: var(--tx-sub);
        border-bottom: 1px solid var(--bd);
        position: sticky;
        top: 0;
        z-index: 1;
    }
    .file-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--bd-lt);
        color: var(--tx);
        vertical-align: middle;
    }
    
    .cell-name {
        word-break: break-all;
    }
    .orig-name {
        font-size: 13px;
        color: var(--tx-sub);
        margin-bottom: 4px;
        text-decoration: line-through;
        opacity: 0.8;
    }
    .new-name {
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: flex-start;
        gap: 6px;
    }
    .new-name i {
        margin-top: 2px;
        opacity: 0.6;
    }
    .changed-text {
        color: var(--ac);
    }
    .btn-del-file {
        background: none;
        border: none;
        color: var(--tx-mt);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
    }
    .btn-del-file:hover {
        color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
    }

    /* Dropdown */
    .dropdown-wrapper {
        position: relative;
        display: inline-block;
    }
    .dropdown-menu {
        display: none;
        position: absolute;
        left: 0;
        background-color: var(--bg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10;
        border-radius: var(--r);
        border: 1px solid var(--bd);
        overflow: hidden;
    }
    .dropdown-menu.show {
        display: block;
    }
    .dropdown-menu button {
        color: var(--tx);
        padding: 10px 14px;
        text-decoration: none;
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-family: var(--font);
    }
    .dropdown-menu button:hover {
        background-color: var(--bg-sub);
        color: var(--ac);
    }
    
    .icon-spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        100% { transform: rotate(360deg); }
    }

    /* Custom Select */
    .custom-select-wrapper {
        position: relative;
    }
    .custom-select-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 100%;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: flex;
        flex-direction: column;
        padding: 4px;
        max-height: 200px;
        overflow-y: auto;
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
        font-family: var(--font);
    }
    .custom-select-option:hover {
        background: var(--bg-alt);
    }
    .custom-select-option.active {
        background: rgba(74, 144, 217, 0.1);
        color: var(--ac);
        font-weight: 500;
    }
</style>
