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
    import Donate from '$lib/components/Donate.svelte';
    
    let dict = $derived($page.data.dict);
    
    let compressorTexts = $derived({
        uploadTitle: t('compress_video.upload.title', dict),
        uploadSubtitle: t('compress_video.upload.subtitle', dict),
        btnSelect: t('compress_video.upload.btn_select', dict),
        btnSample: t('compress_video.upload.btn_sample', dict),
        hint: t('compress_video.upload.hint', dict),
        autoOptimizeLbl: t('compress_video.settings.auto_optimize', dict),
        sizeLbl: t('compress_video.settings.size_lbl', dict),
        btnCompress: t('compress_video.btn.compress', dict),
        btnDownload: t('compress_video.btn.download', dict),
        btnCompressNew: t('compress_video.btn.compress_new', dict),
        procCompressing: t('compress_video.proc.compressing', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('compress-video'));
</script>

<Seo title={t('compress_video.seo.title', dict)} description={t('compress_video.seo.description', dict)} />

<div class="hero">
    <h1>{t('compress_video.hero.title', dict)}</h1>
    <p>{t('compress_video.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoCompressor texts={compressorTexts} />
        <HowToUse title={t('compress_video.how_to_use.title', dict)} steps={Array.isArray(t('compress_video.how_to_use.steps', dict)) ? t('compress_video.how_to_use.steps', dict) : []} />
        <WhyUse title={t('compress_video.why_use.title', dict)} benefits={Array.isArray(t('compress_video.why_use.benefits', dict)) ? t('compress_video.why_use.benefits', dict) : []} />
        <Faq title={t('compress_video.faq.title', dict)} items={Array.isArray(t('compress_video.faq.items', dict)) ? t('compress_video.faq.items', dict) : []} />
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
