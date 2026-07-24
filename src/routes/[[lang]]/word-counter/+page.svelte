<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import WordCounter from '$lib/components/tools/WordCounter.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        placeholder: t('word_counter.placeholder', dict) || 'Type or paste your text here...',
        wordCount: t('word_counter.wordCount', dict) || 'Words',
        charCount: t('word_counter.charCount', dict) || 'Characters',
        charCountNoSpace: t('word_counter.charCountNoSpace', dict) || 'Characters (no spaces)',
        sentenceCount: t('word_counter.sentenceCount', dict) || 'Sentences',
        paragraphCount: t('word_counter.paragraphCount', dict) || 'Paragraphs',
        syllableCount: t('word_counter.syllableCount', dict) || 'Syllables',
        readTime: t('word_counter.readTime', dict) || 'Reading Time',
        speakTime: t('word_counter.speakTime', dict) || 'Speaking Time',
        keywordDensity: t('word_counter.keywordDensity', dict) || 'Keyword Density',
        clearBtn: t('word_counter.clearBtn', dict) || 'Clear',
        copyBtn: t('word_counter.copyBtn', dict) || 'Copy to Clipboard',
        uploadBtn: t('word_counter.uploadBtn', dict) || '',
        noData: t('word_counter.noData', dict) || 'No Data...',
    });

    let relatedTools = $derived(getRelatedTools('word-counter'));
</script>

<Seo 
    title={t('tool.word_counter.seo.title', dict) || ''} 
    description={t('tool.word_counter.seo.description', dict) || ''}
/>

<div class="hero">
    <h1>{t('tool.word_counter.hero.title', dict) || ''}</h1>
    <p>{t('tool.word_counter.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <WordCounter texts={componentTexts} />
        
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <!-- Ads -->
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
