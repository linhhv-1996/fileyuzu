<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import EpubToPdfConverter from '$lib/components/tools/EpubToPdfConverter.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import Adcash250Banner from '$lib/components/Ads/Adcash250Banner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        title: t('epub_to_pdf.upload.title', dict),
        subtitle: t('epub_to_pdf.upload.subtitle', dict),
        btnSelect: t('epub_to_pdf.upload.btn_select', dict),
        btnSample: t('epub_to_pdf.btn.sample', dict) || 'Load sample',
        hint: t('epub_to_pdf.upload.hint', dict),
        btnConvert: t('epub_to_pdf.btn.convert', dict),
        btnConvertNew: t('epub_to_pdf.btn.convert_new', dict),
        btnDownload: t('epub_to_pdf.btn.download', dict),
        procInitializing: t('epub_to_pdf.proc.initializing', dict),
        procReading: t('epub_to_pdf.proc.reading', dict),
        procConverting: t('epub_to_pdf.proc.converting', dict),
        error: t('epub_to_pdf.error', dict)
    });
    
    let relatedTools = $derived(getRelatedTools('epub-to-pdf'));
</script>

<Seo title={t('epub_to_pdf.seo.title', dict)} description={t('epub_to_pdf.seo.description', dict)} />

<div class="hero">
    <h1>{t('epub_to_pdf.hero.title', dict)}</h1>
    <p>{t('epub_to_pdf.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <EpubToPdfConverter texts={converterTexts} />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <Adcash250Banner />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
