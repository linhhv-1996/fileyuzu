<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import EbookConverter from '$lib/components/tools/EbookConverter.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import { adsConfig } from '$lib/config/ads';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    import AdsterraBanner from '$lib/components/Ads/AdsterraBanner.svelte';
    import EXOBanner from '$lib/components/Ads/EXOBanner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        title: t('ebook_converter.upload.title', dict),
        subtitle: t('ebook_converter.upload.subtitle', dict),
        btnSelect: t('ebook_converter.upload.btn_select', dict),
        btnSample: t('ebook_converter.btn.sample', dict) || 'Load sample',
        hint: t('ebook_converter.upload.hint', dict),
        btnConvert: t('ebook_converter.btn.convert', dict),
        btnConvertNew: t('ebook_converter.btn.convert_new', dict),
        btnDownload: t('ebook_converter.btn.download', dict),
        procInitializing: t('ebook_converter.proc.initializing', dict),
        procReading: t('ebook_converter.proc.reading', dict),
        procConverting: t('ebook_converter.proc.converting', dict),
        error: t('ebook_converter.error', dict),
        selectOutput: t('ebook_converter.format.select_output', dict)
    });
    
    // We can fallback to 'epub-to-pdf' if we haven't defined 'ebook-converter' related tools yet, 
    // or just assume 'ebook-converter' is defined in config.
    let relatedTools = $derived(getRelatedTools('ebook-converter') || getRelatedTools('epub-to-pdf'));
</script>

<Seo title={t('ebook_converter.seo.title', dict)} description={t('ebook_converter.seo.description', dict)} />

<div class="hero">
    <h1>{t('ebook_converter.hero.title', dict)}</h1>
    <p>{t('ebook_converter.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <EbookConverter texts={converterTexts} />
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
