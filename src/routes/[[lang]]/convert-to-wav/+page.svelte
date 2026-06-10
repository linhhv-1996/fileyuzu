<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import AudioConverter from '$lib/components/tools/AudioConverter.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Donate from '$lib/components/Donate.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        uploadTitle: t('convert_to_wav.upload.title', dict),
        uploadSubtitle: t('convert_to_wav.upload.subtitle', dict),
        btnSelect: t('convert_to_wav.upload.btn_select', dict),
        btnSample: t('convert_to_wav.upload.btn_sample', dict),
        hint: t('convert_to_wav.upload.hint', dict),
        formatLbl: t('convert_to_wav.settings.format_lbl', dict),
        btnConvert: t('convert_to_wav.btn.convert', dict),
        btnDownload: t('convert_to_wav.btn.download', dict),
        btnConvertNew: t('convert_to_wav.btn.convert_new', dict),
        procConverting: t('convert_to_wav.proc.converting', dict),
        btnAddMore: t('convert_to_wav.btn.add_more', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('convert-to-wav'));
</script>

<Seo title={t('convert_to_wav.seo.title', dict)} description={t('convert_to_wav.seo.description', dict)} />

<div class="hero">
    <h1>{t('convert_to_wav.hero.title', dict)}</h1>
    <p>{t('convert_to_wav.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <AudioConverter 
            texts={converterTexts} 
            outputFormats={['wav']} 
            sampleAudioPath={'/sample-speech-1m.mp3'}
        />
        <HowToUse title={t('convert_to_wav.how_to_use.title', dict)} steps={Array.isArray(t('convert_to_wav.how_to_use.steps', dict)) ? t('convert_to_wav.how_to_use.steps', dict) : []} />
        <WhyUse title={t('convert_to_wav.why_use.title', dict)} benefits={Array.isArray(t('convert_to_wav.why_use.benefits', dict)) ? t('convert_to_wav.why_use.benefits', dict) : []} />
        <Faq title={t('convert_to_wav.faq.title', dict)} items={Array.isArray(t('convert_to_wav.faq.items', dict)) ? t('convert_to_wav.faq.items', dict) : []} />
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
