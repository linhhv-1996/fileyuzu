<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import VideoCompressor from '$lib/components/tools/VideoCompressor.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    
    let dict = $derived($page.data.dict);
    
    let compressorTexts = $derived({
        uploadTitle: t('reduce_video_size.upload.title', dict),
        uploadSubtitle: t('reduce_video_size.upload.subtitle', dict),
        btnSelect: t('reduce_video_size.upload.btn_select', dict),
        btnSample: t('reduce_video_size.upload.btn_sample', dict),
        hint: t('reduce_video_size.upload.hint', dict),
        autoOptimizeLbl: t('reduce_video_size.settings.auto_optimize', dict),
        sizeLbl: t('reduce_video_size.settings.size_lbl', dict),
        btnCompress: t('reduce_video_size.btn.compress', dict),
        btnDownload: t('reduce_video_size.btn.download', dict),
        btnCompressNew: t('reduce_video_size.btn.compress_new', dict),
        procCompressing: t('reduce_video_size.proc.compressing', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('reduce-video-size'));
</script>

<Seo title={t('reduce_video_size.seo.title', dict)} description={t('reduce_video_size.seo.description', dict)} />

<div class="hero">
    <h1>{t('reduce_video_size.hero.title', dict)}</h1>
    <p>{t('reduce_video_size.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoCompressor texts={compressorTexts} />
        <HowToUse title={t('reduce_video_size.how_to_use.title', dict)} steps={Array.isArray(t('reduce_video_size.how_to_use.steps', dict)) ? t('reduce_video_size.how_to_use.steps', dict) : []} />
        <WhyUse title={t('reduce_video_size.why_use.title', dict)} benefits={Array.isArray(t('reduce_video_size.why_use.benefits', dict)) ? t('reduce_video_size.why_use.benefits', dict) : []} />
        <Faq title={t('reduce_video_size.faq.title', dict)} items={Array.isArray(t('reduce_video_size.faq.items', dict)) ? t('reduce_video_size.faq.items', dict) : []} />
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
