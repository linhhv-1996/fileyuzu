<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import VideoConverter from '$lib/components/tools/VideoConverter.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import BannerAds from '$lib/components/Ads/BannerAds.svelte';
    import { adsConfig } from '$lib/config/ads';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        uploadTitle: t('video_converter.upload.title', dict),
        uploadSubtitle: t('video_converter.upload.subtitle', dict),
        btnSelect: t('video_converter.upload.btn_select', dict),
        btnSample: t('video_converter.upload.btn_sample', dict),
        hint: t('video_converter.upload.hint', dict),
        formatLbl: t('video_converter.settings.format_lbl', dict),
        btnConvert: t('video_converter.btn.convert', dict),
        btnDownload: t('video_converter.btn.download', dict),
        btnConvertNew: t('video_converter.btn.convert_new', dict),
        procConverting: t('video_converter.proc.converting', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('video-converter'));
</script>

<Seo title={t('video_converter.seo.title', dict)} description={t('video_converter.seo.description', dict)} />

<div class="hero">
    <h1>{t('video_converter.hero.title', dict)}</h1>
    <p>{t('video_converter.hero.description', dict)}</p>
</div>


<!-- Ad banner -->

<!-- <div class="banner-leaderboard">
    <div style="width: 728px; height: 90px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #888; border: 1px dashed #bbb; font-weight: bold; border-radius: 4px;">
        728x90 Ads Placeholder
    </div>
</div>

<div class="banner-mobile">
    <div style="width: 320px; height: 50px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #888; border: 1px dashed #bbb; font-weight: bold; border-radius: 4px;">
        320x50 Ads Placeholder
    </div>
</div> -->

<div class="grid">
    <main>
        <VideoConverter texts={converterTexts} />
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
