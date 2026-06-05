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
    import Donate from '$lib/components/Donate.svelte';
    
    let dict = $derived($page.data.dict);
    
    let generatorTexts = $derived({
        contentLbl: t('jan_code_generator.content_lbl', dict),
        contentPlaceholder: t('jan_code_generator.content_placeholder', dict),
        typeLbl: t('jan_code_generator.type_lbl', dict),
        scaleLbl: t('jan_code_generator.scale_lbl', dict),
        labelLbl: t('jan_code_generator.label_lbl', dict),
        formatLbl: t('jan_code_generator.format_lbl', dict),
        btnGenerate: t('jan_code_generator.btn_generate', dict),
        resultsTitle: t('jan_code_generator.results_title', dict),
        btnDownload: t('jan_code_generator.btn_download', dict),
        btnDownloadZip: t('barcode_generator.btn_download_zip', dict),
        btnGenNew: t('jan_code_generator.btn_downloadbtn_gen_new', dict),
        yes: t('jan_code_generator.yes', dict),
        no: t('jan_code_generator.no', dict)
    });

    let relatedTools = $derived(getRelatedTools('jan-code-generator'));
</script>

<Seo title={t('jan_code_generator.seo.title', dict)} description={t('jan_code_generator.seo.description', dict)} noHreflang={true} allowedMarkets={["ja"]}/>

<div class="hero">
    <h1>{t('jan_code_generator.hero.title', dict)}</h1>
    <p>{t('jan_code_generator.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <!-- Use BarcodeGenerator but pass initialType="ean13" to default to JAN -->
        <BarcodeGenerator texts={generatorTexts} initialType="ean13" />
        
        <HowToUse title={t('jan_code_generator.how_to_use.title', dict)} steps={Array.isArray(t('jan_code_generator.how_to_use.steps', dict)) ? t('jan_code_generator.how_to_use.steps', dict) : []} />
        <WhyUse title={t('jan_code_generator.why_use.title', dict)} benefits={Array.isArray(t('jan_code_generator.why_use.benefits', dict)) ? t('jan_code_generator.why_use.benefits', dict) : []} />
        <Faq title={t('jan_code_generator.faq.title', dict)} items={Array.isArray(t('jan_code_generator.faq.items', dict)) ? t('jan_code_generator.faq.items', dict) : []} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <Donate {dict} />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
