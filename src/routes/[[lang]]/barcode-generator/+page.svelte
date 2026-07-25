<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import BarcodeGenerator from '$lib/components/tools/BarcodeGenerator.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import { adsConfig } from '$lib/config/ads';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    
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
        no: t('barcode_generator.no', dict),
        tabManual: t('barcode_generator.tab_manual', dict),
        tabFile: t('barcode_generator.tab_file', dict),
        tabSequence: t('barcode_generator.tab_sequence', dict),
        tipManual: t('barcode_generator.tip_manual', dict),
        uploadHint: t('barcode_generator.upload_hint', dict),
        uploadSubhint: t('barcode_generator.upload_subhint', dict),
        seqStart: t('barcode_generator.seq_start', dict),
        seqQty: t('barcode_generator.seq_qty', dict),
        seqStep: t('barcode_generator.seq_step', dict),
        generating: t('barcode_generator.generating', dict),
    });

    let relatedTools = $derived(getRelatedTools('barcode-generator'));
</script>

<Seo title={t('barcode_generator.seo.title', dict)} description={t('barcode_generator.seo.description', dict)} />

<div class="hero">
    <h1>{t('barcode_generator.hero.title', dict)}</h1>
    <p>{t('barcode_generator.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <BarcodeGenerator texts={generatorTexts} />
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
