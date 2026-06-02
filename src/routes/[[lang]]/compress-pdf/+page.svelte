<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import PDFCompress from '$lib/components/tools/PDFCompress.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    
    let dict = $derived($page.data.dict);
    
    let compressorTexts = $derived({
        uploadTitle: t('pdf_compressor.upload.title', dict),
        uploadSubtitle: t('pdf_compressor.upload.subtitle', dict),
        btnSelect: t('pdf_compressor.upload.btn_select', dict),
        btnSample: t('pdf_compressor.upload.btn_sample', dict),
        hint: t('pdf_compressor.upload.hint', dict),
        qualityLbl: t('pdf_compressor.settings.quality_lbl', dict),
        qualityBalanced: t('pdf_compressor.settings.quality_balanced', dict),
        qualityMaximum: t('pdf_compressor.settings.quality_maximum', dict),
        passwordLbl: t('pdf_compressor.settings.password_lbl', dict),
        passwordPlaceholder: t('pdf_compressor.settings.password_placeholder', dict),
        btnCompress: t('pdf_compressor.btn.compress', dict),
        btnDownload: t('pdf_compressor.btn.download', dict),
        btnCompressNew: t('pdf_compressor.btn.compress_new', dict),
        procCompressing: t('pdf_compressor.proc.compressing', dict),
        pages: t('pdf_compressor.pages', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('compress-pdf'));
</script>

<Seo title={t('pdf_compressor.seo.title', dict)} description={t('pdf_compressor.seo.description', dict)} />

<div class="hero">
    <h1>{t('pdf_compressor.hero.title', dict)}</h1>
    <p>{t('pdf_compressor.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <PDFCompress texts={compressorTexts} />
        <HowToUse title={t('pdf_compressor.how_to_use.title', dict)} steps={Array.isArray(t('pdf_compressor.how_to_use.steps', dict)) ? t('pdf_compressor.how_to_use.steps', dict) : []} />
        <WhyUse title={t('pdf_compressor.why_use.title', dict)} benefits={Array.isArray(t('pdf_compressor.why_use.benefits', dict)) ? t('pdf_compressor.why_use.benefits', dict) : []} />
        <Faq title={t('pdf_compressor.faq.title', dict)} items={Array.isArray(t('pdf_compressor.faq.items', dict)) ? t('pdf_compressor.faq.items', dict) : []} />
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
