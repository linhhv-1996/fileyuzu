<script lang="ts">
    import { getTransliterationSuggestions } from '$lib/utils/transliterate';

    let { texts } = $props<{
        texts: {
            placeholder: string;
            outputPlaceholder: string;
            clearBtn: string;
            copyBtn: string;
        };
    }>();

    let input = $state('');
    let targetLang = $state('ru');
    let textareaEl: HTMLTextAreaElement;

    let currentSuggestions = $state<string[]>([]);
    let activeWordStart = $state(0);
    let activeWordLength = $state(0);

    const modes = [
        { id: 'ru', label: 'Russian' },
        { id: 'ur', label: 'Urdu' },
        { id: 'ta', label: 'Tamil' },
        { id: 'pa', label: 'Punjabi' },
        { id: 'ar', label: 'Arabic' },
        { id: 'gu', label: 'Gujarati' },
        { id: 'mr', label: 'Marathi' },
        { id: 'bn', label: 'Bengali' },
        { id: 'si', label: 'Sinhala' },
        { id: 'hi', label: 'Hindi' }
    ];

    async function handleCopy() {
        if (!input) return;
        try {
            await navigator.clipboard.writeText(input);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    function handleClear() {
        input = '';
        currentSuggestions = [];
    }

    async function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== ' ' && e.key !== 'Enter') {
            currentSuggestions = []; // hide suggestions on normal typing
            return;
        }

        const cursorPosition = textareaEl.selectionStart;
        const text = input;

        // Find the start of the current word before the cursor
        let wordStart = cursorPosition - 1;
        while (wordStart >= 0 && !/[\s\n\t.,!?(){}[\]<>"']/.test(text[wordStart])) {
            wordStart--;
        }
        wordStart++;

        const wordToTransliterate = text.substring(wordStart, cursorPosition);
        
        if (wordToTransliterate.trim().length > 0) {
            e.preventDefault();
            
            // Insert the typed character (space or enter) immediately
            const charToAdd = e.key === 'Enter' ? '\n' : ' ';
            input = text.substring(0, wordStart) + wordToTransliterate + charToAdd + text.substring(cursorPosition);
            
            const expectedCursor = wordStart + wordToTransliterate.length + 1;
            setTimeout(() => {
                textareaEl.selectionStart = textareaEl.selectionEnd = expectedCursor;
            }, 0);

            // Fetch transliteration
            const suggestions = await getTransliterationSuggestions(wordToTransliterate, targetLang);
            
            if (suggestions.length > 0) {
                const bestMatch = suggestions[0];
                
                if (bestMatch !== wordToTransliterate) {
                    // Check if the word is still at the same position in the state
                    if (input.substring(wordStart, wordStart + wordToTransliterate.length) === wordToTransliterate) {
                        const currentCursor = textareaEl.selectionStart;
                        const before = input.substring(0, wordStart);
                        const after = input.substring(wordStart + wordToTransliterate.length);
                        
                        // Overwrite with the best match automatically!
                        input = before + bestMatch + after;
                        
                        // Adjust cursor if it was ahead of the replaced word
                        const diff = bestMatch.length - wordToTransliterate.length;
                        if (currentCursor > wordStart) {
                            setTimeout(() => {
                                textareaEl.selectionStart = textareaEl.selectionEnd = currentCursor + diff;
                            }, 0);
                        }
                        
                        // Show suggestions dropdown
                        if (suggestions.length > 1) {
                            currentSuggestions = suggestions;
                            activeWordStart = wordStart;
                            activeWordLength = bestMatch.length;
                        }
                    }
                }
            }
        }
    }

    function selectSuggestion(sugg: string) {
        const currentText = textareaEl.value;
        const currentCursor = textareaEl.selectionStart;
        
        const before = currentText.substring(0, activeWordStart);
        const after = currentText.substring(activeWordStart + activeWordLength);
        
        input = before + sugg + after;
        
        const diff = sugg.length - activeWordLength;
        if (currentCursor > activeWordStart) {
            setTimeout(() => {
                textareaEl.selectionStart = textareaEl.selectionEnd = currentCursor + diff;
            }, 0);
        }
        
        currentSuggestions = [];
        textareaEl.focus();
    }
</script>

<div class="card tool-body">
    <div class="editor-header">
        <div class="top-toolbar">
            <div class="toolbar-left">
                <select bind:value={targetLang} class="mode-select">
                    {#each modes as m}
                        <option value={m.id}>{m.label}</option>
                    {/each}
                </select>
            </div>
            <div class="toolbar-right">
                <button class="action-btn" onclick={handleCopy} disabled={input.length === 0}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{texts.copyBtn || 'Copy'}</span>
                </button>
                <button class="action-btn" onclick={handleClear} disabled={input.length === 0}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>{texts.clearBtn || 'Clear'}</span>
                </button>
            </div>
        </div>
    </div>

    <div class="text-area-container">
        <textarea
            bind:this={textareaEl}
            bind:value={input}
            onkeydown={handleKeyDown}
            placeholder="Type phonetically in English here and press Space to convert (e.g., 'namaste' + Space)..."
            class="input-area"
            spellcheck="false"
        ></textarea>
        
        {#if currentSuggestions.length > 0}
        <div class="suggestions-bar">
            <span class="sugg-label">Suggestions:</span>
            <div class="sugg-list">
                {#each currentSuggestions as sugg}
                    <button class="sugg-btn" onclick={() => selectSuggestion(sugg)}>{sugg}</button>
                {/each}
            </div>
        </div>
        {/if}
    </div>
</div>

<style>
    .editor-header {
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .top-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .toolbar-left, .toolbar-right {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .mode-select {
        background: var(--bg-sub);
        border: 1px solid var(--bd-lt);
        border-radius: 3px;
        padding: 7px 12px;
        color: var(--tx);
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        transition: all 0.2s;
        min-width: 200px;
    }
    .mode-select:focus {
        border-color: var(--ac);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    .action-btn {
        background: var(--bg-sub);
        border: 1px solid var(--bd-lt);
        border-radius: 4px;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--tx-sub);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    .action-btn:hover:not(:disabled) {
        color: var(--tx);
        background: var(--bg);
        border-color: var(--bd);
    }
    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .text-area-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
    }
    
    .suggestions-bar {
        position: absolute;
        bottom: 16px;
        left: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 12px;
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 3px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: fadeIn 0.2s ease-out;
        z-index: 10;
        max-width: calc(100% - 32px);
        overflow: hidden;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .sugg-label {
        font-size: 12px;
        color: var(--tx-sub);
        font-weight: 500;
        white-space: nowrap;
    }
    .sugg-list {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
    }
    .sugg-list::-webkit-scrollbar {
        height: 4px;
    }
    .sugg-list::-webkit-scrollbar-thumb {
        background: var(--bd);
        border-radius: 4px;
    }
    .sugg-btn {
        background: var(--bg);
        border: 1px solid var(--bd);
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 14px;
        color: var(--tx);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
    }
    .sugg-btn:hover {
        background: var(--ac);
        color: white;
        border-color: var(--ac);
    }
    
    .text-area-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .input-area {
        width: 100%;
        min-height: 350px;
        padding: 16px;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        font-family: var(--font);
        font-size: 16px;
        line-height: 1.6;
        color: var(--tx);
        resize: vertical;
        background: var(--bg);
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-area:focus {
        outline: none;
        border-color: var(--ac);
        box-shadow: var(--shadow-glow);
    }
    
    @media (max-width: 600px) {
        .top-toolbar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
        .toolbar-left, .toolbar-right {
            width: 100%;
        }
        .mode-select {
            width: 100%;
        }
        .action-btn {
            flex: 1;
            justify-content: center;
        }
        .input-area {
            min-height: 300px;
        }
    }
</style>
