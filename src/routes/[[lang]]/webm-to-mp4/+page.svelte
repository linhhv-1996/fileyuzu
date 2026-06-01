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
    
    let relatedTools = $derived(getRelatedTools('webm-to-mp4'));
</script>

<svelte:head>
    <title>{t('webm_to_mp4.seo.title', dict)}</title>
    <meta name="description" content={t('webm_to_mp4.seo.description', dict)}>
</svelte:head>

<div class="hero">
    <h1>{t('webm_to_mp4.hero.title', dict)}</h1>
    <p>{t('webm_to_mp4.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoConverter 
            texts={converterTexts} 
            inputFormats=".webm,video/webm" 
            outputFormats={['mp4']} 
            sampleVideoPath="/file_example_WEBM_1920_3_7MB.webm" 
        />
        <HowToUse title={t('webm_to_mp4.how_to_use.title', dict)} steps={Array.isArray(t('webm_to_mp4.how_to_use.steps', dict)) ? t('webm_to_mp4.how_to_use.steps', dict) : []} />
        <WhyUse title={t('webm_to_mp4.why_use.title', dict)} benefits={Array.isArray(t('webm_to_mp4.why_use.benefits', dict)) ? t('webm_to_mp4.why_use.benefits', dict) : []} />
        <Faq title={t('webm_to_mp4.faq.title', dict)} items={Array.isArray(t('webm_to_mp4.faq.items', dict)) ? t('webm_to_mp4.faq.items', dict) : []} />
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
