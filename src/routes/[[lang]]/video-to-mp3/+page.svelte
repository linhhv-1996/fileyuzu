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
    import Donate from '$lib/components/Donate.svelte';
    
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
        <HowToUse title={t('video_to_mp3.how_to_use.title', dict)} steps={Array.isArray(t('video_to_mp3.how_to_use.steps', dict)) ? t('video_to_mp3.how_to_use.steps', dict) : []} />
        <WhyUse title={t('video_to_mp3.why_use.title', dict)} benefits={Array.isArray(t('video_to_mp3.why_use.benefits', dict)) ? t('video_to_mp3.why_use.benefits', dict) : []} />
        <Faq title={t('video_to_mp3.faq.title', dict)} items={Array.isArray(t('video_to_mp3.faq.items', dict)) ? t('video_to_mp3.faq.items', dict) : []} />
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
