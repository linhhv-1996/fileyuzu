<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import OCRReader from '$lib/components/tools/OCRReader.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    
    let dict = $derived($page.data.dict);
    
    let ocrTexts = $derived({
        btnCopy: t('handwriting_ocr.btn.copy', dict),
        btnCopyAll: t('handwriting_ocr.btn.copy_all', dict),
        btnClean: t('handwriting_ocr.btn.clean', dict),
        btnJoin: t('handwriting_ocr.btn.join', dict),
        btnLoadSample: t('handwriting_ocr.upload.btn_sample', dict),
        uploadTitle: t('handwriting_ocr.upload.title', dict),
        uploadSubtitle: t('handwriting_ocr.upload.subtitle', dict),
        btnSelect: t('handwriting_ocr.upload.btn_select', dict),
        uploadHint: t('handwriting_ocr.upload.hint', dict),
        trySamples: t('image_to_text.text.try_samples', dict),
        statusWaiting: t('handwriting_ocr.status.waiting', dict),
        statusPending: t('handwriting_ocr.status.pending', dict),
        statusProcessing: t('handwriting_ocr.status.processing', dict),
        statusDone: t('handwriting_ocr.status.done', dict)
    });

    // We can use a different related tool like 'compress-video' or just pass 'handwriting-ocr' to filter out
    let relatedTools = $derived(getRelatedTools('handwriting-ocr'));
</script>

<Seo title={t('handwriting_ocr.seo.title', dict)} description={t('handwriting_ocr.seo.description', dict)} allowedMarkets={["en", "ja", "ko"]}/>

<div class="hero">
    <h1>{t('handwriting_ocr.hero.title', dict)}</h1>
    <p>{t('handwriting_ocr.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <OCRReader texts={ocrTexts} />
        <HowToUse title={t('handwriting_ocr.how_to_use.title', dict)} steps={Array.isArray(t('handwriting_ocr.how_to_use.steps', dict)) ? t('handwriting_ocr.how_to_use.steps', dict) : []} />
        <WhyUse title={t('handwriting_ocr.why_use.title', dict)} benefits={Array.isArray(t('handwriting_ocr.why_use.benefits', dict)) ? t('handwriting_ocr.why_use.benefits', dict) : []} />
        <Faq title={t('handwriting_ocr.faq.title', dict)} items={Array.isArray(t('handwriting_ocr.faq.items', dict)) ? t('handwriting_ocr.faq.items', dict) : []} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
