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
    import AdsterraBanner from '$lib/components/Ads/AdsterraBanner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        uploadTitle: t('video_2_mp3.upload.title', dict),
        uploadSubtitle: t('video_2_mp3.upload.subtitle', dict),
        btnSelect: t('video_2_mp3.upload.btn_select', dict),
        btnSample: t('video_2_mp3.upload.btn_sample', dict),
        hint: t('video_2_mp3.upload.hint', dict),

        formatLbl: t('video_converter.settings.format_lbl', dict),
        btnConvert: t('video_converter.btn.convert', dict),
        btnDownload: t('video_converter.btn.download', dict),
        btnConvertNew: t('video_converter.btn.convert_new', dict),
        procConverting: t('video_converter.proc.converting', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('video-to-mp3'));
</script>

<Seo title={t('video_to_mp3.seo.title', dict)} description={t('video_to_mp3.seo.description', dict)} />

<div class="hero">
    <h1>{t('video_to_mp3.hero.title', dict)}</h1>
    <p>{t('video_to_mp3.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoConverter 
            texts={converterTexts} 
            inputFormats="video/*" 
            outputFormats={['mp3']} 
            sampleVideoPath="/file_sample_build_in_public.mp4" 
        />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <AdsterraBanner 
                adKey="85c87dc7bfff537a2e642741cb7ba59a" 
                size="300x250" 
                reloadAfter={20}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
