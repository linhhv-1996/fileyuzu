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
        uploadTitle: t('audio_converter.upload.title', dict),
        uploadSubtitle: t('audio_converter.upload.subtitle', dict),
        btnSelect: t('audio_converter.upload.btn_select', dict),
        btnSample: t('audio_converter.upload.btn_sample', dict),
        hint: t('audio_converter.upload.hint', dict),
        formatLbl: t('audio_converter.settings.format_lbl', dict),
        btnConvert: t('audio_converter.btn.convert', dict),
        btnDownload: t('audio_converter.btn.download', dict),
        btnConvertNew: t('audio_converter.btn.convert_new', dict),
        procConverting: t('audio_converter.proc.converting', dict),
        btnAddMore: t('audio_converter.btn.add_more', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('audio-converter'));
</script>

<Seo title={t('audio_converter.seo.title', dict)} description={t('audio_converter.seo.description', dict)} />

<div class="hero">
    <h1>{t('audio_converter.hero.title', dict)}</h1>
    <p>{t('audio_converter.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <AudioConverter texts={converterTexts} />
        <HowToUse title={t('audio_converter.how_to_use.title', dict)} steps={Array.isArray(t('audio_converter.how_to_use.steps', dict)) ? t('audio_converter.how_to_use.steps', dict) : []} />
        <WhyUse title={t('audio_converter.why_use.title', dict)} benefits={Array.isArray(t('audio_converter.why_use.benefits', dict)) ? t('audio_converter.why_use.benefits', dict) : []} />
        <Faq title={t('audio_converter.faq.title', dict)} items={Array.isArray(t('audio_converter.faq.items', dict)) ? t('audio_converter.faq.items', dict) : []} />
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
