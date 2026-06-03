<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import BarcodeGenerator from '$lib/components/tools/BarcodeGenerator.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    
    let dict = $derived($page.data.dict);
    
    let generatorTexts = $derived({
        contentLbl: t('barcode_generator.content_lbl', dict),
        contentPlaceholder: t('barcode_generator.content_placeholder', dict),
        typeLbl: t('barcode_generator.type_lbl', dict),
        scaleLbl: t('barcode_generator.scale_lbl', dict),
        labelLbl: t('barcode_generator.label_lbl', dict),
        formatLbl: t('barcode_generator.format_lbl', dict),
        btnGenerate: t('barcode_generator.btn_generate', dict),
        resultsTitle: t('barcode_generator.results_title', dict),
        btnDownload: t('barcode_generator.btn_download', dict),
        btnDownloadZip: t('barcode_generator.btn_download_zip', dict),
        btnGenNew: t('barcode_generator.btn_downloadbtn_gen_new', dict),
        yes: t('barcode_generator.yes', dict),
        no: t('barcode_generator.no', dict)
    });

    let relatedTools = $derived(getRelatedTools('barcode-generator'));
</script>

<Seo title={t('barcode_generator.seo.title', dict)} description={t('barcode_generator.seo.description', dict)} allowedMarkets={["en", "ja", "ko", "zh-tw", "pt-br", "th"]}/>

<div class="hero">
    <h1>{t('barcode_generator.hero.title', dict)}</h1>
    <p>{t('barcode_generator.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <BarcodeGenerator texts={generatorTexts} />
        <HowToUse title={t('barcode_generator.how_to_use.title', dict)} steps={Array.isArray(t('barcode_generator.how_to_use.steps', dict)) ? t('barcode_generator.how_to_use.steps', dict) : []} />
        <WhyUse title={t('barcode_generator.why_use.title', dict)} benefits={Array.isArray(t('barcode_generator.why_use.benefits', dict)) ? t('barcode_generator.why_use.benefits', dict) : []} />
        <Faq title={t('barcode_generator.faq.title', dict)} items={Array.isArray(t('barcode_generator.faq.items', dict)) ? t('barcode_generator.faq.items', dict) : []} />
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
