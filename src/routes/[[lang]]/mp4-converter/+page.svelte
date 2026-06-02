<script lang="ts">
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import VideoConverter from '$lib/components/tools/VideoConverter.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        uploadTitle: t('mp4_converter.upload.title', dict),
        uploadSubtitle: t('mp4_converter.upload.subtitle', dict),
        btnSelect: t('mp4_converter.upload.btn_select', dict),
        btnSample: t('mp4_converter.upload.btn_sample', dict),
        hint: t('mp4_converter.upload.hint', dict),

        formatLbl: t('video_converter.settings.format_lbl', dict),
        btnConvert: t('video_converter.btn.convert', dict),
        btnDownload: t('video_converter.btn.download', dict),
        btnConvertNew: t('video_converter.btn.convert_new', dict),
        procConverting: t('video_converter.proc.converting', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('mp4-converter'));
</script>

<svelte:head>
    <title>{t('mp4_converter.seo.title', dict)}</title>
    <meta name="description" content={t('mp4_converter.seo.description', dict)}>
</svelte:head>

<div class="hero">
    <h1>{t('mp4_converter.hero.title', dict)}</h1>
    <p>{t('mp4_converter.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoConverter 
            texts={converterTexts} 
            outputFormats={['mp4']}
            sampleVideoPath="/sample_960x400_ocean_with_audio.flv"
        />
        <HowToUse title={t('mp4_converter.how_to_use.title', dict)} steps={Array.isArray(t('mp4_converter.how_to_use.steps', dict)) ? t('mp4_converter.how_to_use.steps', dict) : []} />
        <WhyUse title={t('mp4_converter.why_use.title', dict)} benefits={Array.isArray(t('mp4_converter.why_use.benefits', dict)) ? t('mp4_converter.why_use.benefits', dict) : []} />
        <Faq title={t('mp4_converter.faq.title', dict)} items={Array.isArray(t('mp4_converter.faq.items', dict)) ? t('mp4_converter.faq.items', dict) : []} />
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
