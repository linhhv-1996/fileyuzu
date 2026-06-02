<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
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
        uploadTitle: t('mov_to_mp4.upload.title', dict),
        uploadSubtitle: t('mov_to_mp4.upload.subtitle', dict),
        btnSelect: t('mov_to_mp4.upload.btn_select', dict),
        btnSample: t('mov_to_mp4.upload.btn_sample', dict),
        hint: t('mov_to_mp4.upload.hint', dict),

        formatLbl: t('video_converter.settings.format_lbl', dict),
        btnConvert: t('video_converter.btn.convert', dict),
        btnDownload: t('video_converter.btn.download', dict),
        btnConvertNew: t('video_converter.btn.convert_new', dict),
        procConverting: t('video_converter.proc.converting', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('mov-to-mp4'));
</script>

<Seo title={t('mov_to_mp4.seo.title', dict)} description={t('mov_to_mp4.seo.description', dict)} />

<div class="hero">
    <h1>{t('mov_to_mp4.hero.title', dict)}</h1>
    <p>{t('mov_to_mp4.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <VideoConverter 
            texts={converterTexts} 
            inputFormats=".mov,video/quicktime" 
            outputFormats={['mp4']} 
            sampleVideoPath="/file_example_MOV_1920_2_2MB.mov" 
        />
        <HowToUse title={t('mov_to_mp4.how_to_use.title', dict)} steps={Array.isArray(t('mov_to_mp4.how_to_use.steps', dict)) ? t('mov_to_mp4.how_to_use.steps', dict) : []} />
        <WhyUse title={t('mov_to_mp4.why_use.title', dict)} benefits={Array.isArray(t('mov_to_mp4.why_use.benefits', dict)) ? t('mov_to_mp4.why_use.benefits', dict) : []} />
        <Faq title={t('mov_to_mp4.faq.title', dict)} items={Array.isArray(t('mov_to_mp4.faq.items', dict)) ? t('mov_to_mp4.faq.items', dict) : []} />
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
