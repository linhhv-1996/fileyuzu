<script lang="ts">
    import { onMount } from "svelte";
    import { removeStopwords, eng, jpn, zho, kor, tha, vie } from "stopword";
    import { franc } from "franc-min";
    import mammoth from "mammoth";

    let { texts } = $props<{
        texts: {
            placeholder: string;
            wordCount: string;
            charCount: string;
            charCountNoSpace: string;
            sentenceCount: string;
            paragraphCount: string;
            readTime: string;
            speakTime: string;
            keywordDensity: string;
            clearBtn: string;
            copyBtn: string;
            uploadBtn?: string;
            syllableCount?: string;
            noData: string;
        };
    }>();

    let text = $state("");
    let isExtracting = $state(false);

    const WPM_READ = 200;
    const WPM_SPEAK = 130;

    function formatTime(minutes: number): string {
        if (minutes === 0) return "0 min";
        if (minutes < 1) return "< 1 min";
        return `${Math.ceil(minutes)} min`;
    }

    let stats = $derived.by(() => {
        if (!text) {
            return {
                wordCount: 0,
                charCount: 0,
                charCountNoSpace: 0,
                sentenceCount: 0,
                paragraphCount: 0,
                syllableCount: 0,
                readingTime: 0,
                speakingTime: 0,
                keywordDensity: [],
            };
        }

        let charCount = text.length;
        let charCountNoSpace = text.replace(/\s+/g, "").length;

        // Paragraphs
        const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0);
        let paragraphCount = paragraphs.length;

        // Detect Language using franc
        const francLang = franc(text);
        
        let bcp47 = 'en';
        let stopWordsToUse = eng;
        
        if (francLang === 'vie') { bcp47 = 'vi'; stopWordsToUse = vie; }
        else if (francLang === 'jpn') { bcp47 = 'ja'; stopWordsToUse = jpn; }
        else if (francLang === 'zho' || francLang === 'cmn') { bcp47 = 'zh'; stopWordsToUse = zho; }
        else if (francLang === 'kor') { bcp47 = 'ko'; stopWordsToUse = kor; }
        else if (francLang === 'tha') { bcp47 = 'th'; stopWordsToUse = tha; }
        else if (francLang === 'eng') { bcp47 = 'en'; stopWordsToUse = eng; }

        // Sentences
        let sentenceCount = 0;
        try {
            const segmenterSentence = new Intl.Segmenter(bcp47, {
                granularity: "sentence",
            });
            const sentences = Array.from(
                segmenterSentence.segment(text),
            ).filter((s) => s.segment.trim().length > 0);
            sentenceCount = sentences.length;
        } catch (e) {
            sentenceCount = text
                .split(/[.!?]+/)
                .filter((s) => s.trim().length > 0).length;
        }

        // Words
        let words: string[] = [];
        try {
            const segmenterWord = new Intl.Segmenter(bcp47, {
                granularity: "word",
            });
            const segments = Array.from(segmenterWord.segment(text));
            words = segments
                .filter((s) => s.isWordLike)
                .map((s) => s.segment.toLowerCase());
        } catch (e) {
            const matches = text.match(/[\p{L}\p{N}_]+/gu) || [];
            words = matches.map(w => w.toLowerCase());
        }
        let wordCount = words.length;

        let readingTime = wordCount / WPM_READ;
        let speakingTime = wordCount / WPM_SPEAK;

        // Syllable Count
        let syllableCount = 0;
        words.forEach(word => {
            let w = word.toLowerCase();
            if(w.length <= 3) {
                syllableCount += 1;
                return;
            }
            w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            w = w.replace(/^y/, '');
            const syllables = w.match(/[aeiouy]{1,2}/g);
            syllableCount += syllables ? syllables.length : 1;
        });

        // Keyword Density using 'stopword'
        const frequency: Record<string, number> = {};

        // Remove stopwords specifically for the detected language
        const filteredWords = removeStopwords(words, stopWordsToUse);

        filteredWords.forEach((w: string) => {
            // Further minor sanitization to remove single-letter latin noise or numbers
            const isLatinOnly = /^[a-z0-9]+$/i.test(w);
            if (isLatinOnly && w.length === 1) return;

            frequency[w] = (frequency[w] || 0) + 1;
        });

        let keywordDensity = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            // Lọc ra các từ xuất hiện > 1 lần (từ khóa thực sự). 
            // Vẫn giữ lại top 10 ban đầu để phòng trường hợp văn bản quá ngắn (toàn từ count=1).
            .filter(([, count], index) => count > 1 || index < 10)
            // Lấy tối đa 30 từ để UI không bị ngộp
            .slice(0, 30)
            .map(([word, count]) => ({
                word,
                count,
                percent: ((count / wordCount) * 100).toFixed(1),
            }));

        return {
            wordCount,
            charCount,
            charCountNoSpace,
            sentenceCount,
            paragraphCount,
            syllableCount,
            readingTime,
            speakingTime,
            keywordDensity,
        };
    });


    function handleClear() {
        text = "";
    }

    let fileInput: HTMLInputElement;

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        isExtracting = true;
        try {
            const fileName = file.name.toLowerCase();
            
            if (fileName.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else if (fileName.endsWith('.pdf')) {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
                
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdfDocument = await loadingTask.promise;
                let fullText = '';
                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                text = fullText;
            } else {
                // Read as text
                const textContent = await file.text();
                text = textContent;
            }
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Error reading file. Please check if the file is valid.");
        } finally {
            isExtracting = false;
            input.value = "";
        }
    }

    async function handleCopy() {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    // Limits
    const limits = [
        { label: "X (Twitter)", max: 280 },
        { label: "Threads", max: 500 },
        { label: "Meta Title", max: 60 },
        { label: "Meta Desc", max: 160 },
        { label: "Facebook Post", max: 63206 },
        { label: "Instagram Caption", max: 2200 },
    ];
</script>

<div class="card tool-body">
    <div class="editor-header">
        <div class="top-toolbar">
            <div class="toolbar-left">
                <button class="action-btn" onclick={() => fileInput.click()} disabled={isExtracting}>
                    {#if isExtracting}
                        <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                        <span>Extracting...</span>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>{texts.uploadBtn || 'Upload'}</span>
                    {/if}
                </button>
                <input type="file" accept=".txt,.md,.mdx,.csv,.json,.html,text/plain,.docx,.pdf" bind:this={fileInput} onchange={handleFileUpload} style="display: none;" />
            </div>
            <div class="toolbar-right">
                <button class="action-btn" onclick={handleCopy} disabled={text.length === 0}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{texts.copyBtn || 'Copy'}</span>
                </button>
                <button class="action-btn" onclick={handleClear} disabled={text.length === 0}>
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
            bind:value={text}
            placeholder={texts.placeholder}
            class="input-area"
        ></textarea>

        <div class="editor-footer">
            <div class="limits-bar">
                {#each limits as limit}
                    <div
                        class="limit-item"
                        class:over={stats.charCount > limit.max}
                    >
                        {limit.label}:
                        <span class="limit-count">{stats.charCount}</span
                        >/{limit.max}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="stats-section">
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{stats.wordCount}</div>
                <div class="stat-label">{texts.wordCount}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{stats.charCount}</div>
                <div class="stat-label">{texts.charCount}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{stats.charCountNoSpace}</div>
                <div class="stat-label">{texts.charCountNoSpace}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{stats.sentenceCount}</div>
                <div class="stat-label">{texts.sentenceCount}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{stats.paragraphCount}</div>
                <div class="stat-label">{texts.paragraphCount}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{stats.syllableCount}</div>
                <div class="stat-label">{texts.syllableCount || 'Syllables'}</div>
            </div>
            <div class="stat-box half-width">
                <div class="stat-value time-val">
                    {formatTime(stats.readingTime)}
                </div>
                <div class="stat-label">{texts.readTime}</div>
            </div>
            <div class="stat-box half-width">
                <div class="stat-value time-val">
                    {formatTime(stats.speakingTime)}
                </div>
                <div class="stat-label">{texts.speakTime}</div>
            </div>
        </div>

        <div class="density-card">
            <h3 class="density-title">🔍 {texts.keywordDensity}</h3>
            {#if stats.keywordDensity.length > 0}
                <div class="density-list">
                    {#each stats.keywordDensity as item}
                        <div class="density-item">
                            <span class="d-word">{item.word}</span>
                            <span class="d-count"
                                >{item.count} ({item.percent}%)</span
                            >
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="no-data">{texts.noData}</div>
            {/if}
        </div>
    </div>
</div>

<style>
    .editor-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-top: 12px;
        margin-bottom: 12px;
    }
    .limits-bar {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 12px;
        flex: 1;
    }
    .text-area-container {
        position: relative;
    }
    .editor-header {
        margin-bottom: 8px;
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
    .spin-icon {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        100% { transform: rotate(360deg); }
    }
    .input-area {
        width: 100%;
        min-height: 250px;
        padding: 16px;
        border: 1px solid var(--bd);
        border-radius: var(--r);
        font-family: var(--font);
        font-size: 15px;
        color: var(--tx);
        resize: vertical;
        background: var(--bg);
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
    }
    .input-area:focus {
        outline: none;
        border-color: var(--ac);
        box-shadow: var(--shadow-glow);
    }
    .limit-item {
        color: var(--tx-sub);
        background: var(--bg-sub);
        padding: 4px 10px;
        border-radius: 3px;
        border: 1px solid var(--bd-lt);
    }
    .limit-item.over {
        color: #dc2626;
        background: #fee2e2;
        border-color: #fca5a5;
    }
    .limit-count {
        font-weight: 600;
    }
    .stats-section {
        border-top: 1px solid var(--bd-lt);
        padding-top: 12px;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 3px;
        margin-bottom: 12px;
    }
    .stat-box {
        grid-column: span 2;
        background: var(--bg-sub);
        padding: 14px 10px;
        border-radius: var(--r);
        text-align: center;
        border: 1px solid var(--bd-lt);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .stat-box.half-width {
        grid-column: span 3;
    }
    .stat-value {
        font-size: 26px;
        font-weight: 700;
        color: var(--tx);
        line-height: 1;
        margin-bottom: 0px;
    }
    .stat-value.time-val {
        font-size: 18px;
        color: var(--ac);
    }
    .stat-label {
        font-size: 13px;
        color: var(--tx-sub);
    }
    .density-card {
        background: var(--bg-sub);
        padding: 16px;
        border-radius: var(--r);
        border: 1px solid var(--bd-lt);
    }
    .density-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 9px;
        color: var(--tx);
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .density-list {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
    }
    .density-item {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        background: var(--bg);
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid var(--bd-lt);
    }
    .d-word {
        font-weight: 500;
        color: var(--tx);
        word-break: break-word;
        margin-right: 8px;
    }
    .d-count {
        color: var(--tx-sub);
        white-space: nowrap;
    }
    .no-data {
        color: var(--tx-sub);
        font-size: 13px;
        text-align: center;
        padding: 16px 0;
        font-style: italic;
    }
    @media (max-width: 600px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        .stat-box, .stat-box.half-width {
            grid-column: span 1;
        }
        .editor-footer {
            flex-direction: column;
            gap: 12px;
        }
    }
</style>
