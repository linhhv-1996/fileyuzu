<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import BarcodeGenerator from '$lib/components/tools/BarcodeGenerator.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    import { adsConfig } from '$lib/config/ads';
    
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
        no: t('jan_code_generator.no', dict),
        tabManual: t('barcode_generator.tab_manual', dict),
        tabFile: t('barcode_generator.tab_file', dict),
        tabSequence: t('barcode_generator.tab_sequence', dict),
        tipManual: t('barcode_generator.tip_manual', dict),
        uploadHint: t('barcode_generator.upload_hint', dict),
        uploadSubhint: t('barcode_generator.upload_subhint', dict),
        seqStart: t('barcode_generator.seq_start', dict),
        seqQty: t('barcode_generator.seq_qty', dict),
        seqStep: t('barcode_generator.seq_step', dict)
    });

    let relatedTools = $derived(getRelatedTools('jan-code-generator'));
</script>

<Seo title={t('jan_code_generator.seo.title', dict)} description={t('jan_code_generator.seo.description', dict)} />

<div class="hero">
    <h1>{t('jan_code_generator.hero.title', dict)}</h1>
    <p>{t('jan_code_generator.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <!-- Use BarcodeGenerator but pass initialType="ean13" to default to JAN -->
        <BarcodeGenerator texts={generatorTexts} initialType="ean13" />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <YandexBanner 
                adKey={adsConfig.yandex_banner_sidebar_home.id} 
                reloadAfter={adsConfig.yandex_banner_sidebar_home.reload_after} 
                size={adsConfig.yandex_banner_sidebar_home.size}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
