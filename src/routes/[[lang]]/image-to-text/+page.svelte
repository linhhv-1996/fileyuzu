<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import OCRReader from '$lib/components/tools/OCRReader.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import Adcash250Banner from '$lib/components/Ads/Adcash250Banner.svelte';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import { adsConfig } from '$lib/config/ads';
    
    let dict = $derived($page.data.dict);
    
    let ocrTexts = $derived({
        btnCopy: t('image_to_text.btn.copy', dict),
        btnCopyAll: t('image_to_text.btn.copy_all', dict),
        btnClean: t('image_to_text.btn.clean', dict),
        btnJoin: t('image_to_text.btn.join', dict),
        btnLoadSample: t('image_to_text.upload.btn_sample', dict),
        uploadTitle: t('image_to_text.upload.title', dict),
        uploadSubtitle: t('image_to_text.upload.subtitle', dict),
        btnSelect: t('image_to_text.upload.btn_select', dict),
        uploadHint: t('image_to_text.upload.hint', dict),
        trySamples: t('image_to_text.text.try_samples', dict),
        statusWaiting: t('image_to_text.status.waiting', dict),
        statusPending: t('image_to_text.status.pending', dict),
        statusProcessing: t('image_to_text.status.processing', dict),
        statusDone: t('image_to_text.status.done', dict)
    });

    // We can use a different related tool like 'compress-video' or just pass 'image-to-text' to filter out
    let relatedTools = $derived(getRelatedTools('image-to-text'));
</script>

<Seo title={t('image_to_text.seo.title', dict)} description={t('image_to_text.seo.description', dict)} />

<div class="hero">
    <h1>{t('image_to_text.hero.title', dict)}</h1>
    <p>{t('image_to_text.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <OCRReader texts={ocrTexts} />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <BannerAds 
                adKey={adsConfig.banner_sidebar.id} 
                reloadAfter={adsConfig.banner_sidebar.reload_after} 
                size={adsConfig.banner_sidebar.size}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
