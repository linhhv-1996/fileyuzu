<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import PDFLookScanner from '$lib/components/tools/PDFLookScanner.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import AdcashBanner from '$lib/components/Ads/AdcashBanner.svelte';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    import { adsConfig } from '$lib/config/ads';
    import AdsterraBanner from '$lib/components/Ads/AdsterraBanner.svelte';
    
    let dict = $derived($page.data.dict);
    
    let scannerTexts = $derived({
        uploadTitle: t('make_pdf_look_scanned.upload.title', dict),
        uploadSubtitle: t('make_pdf_look_scanned.upload.subtitle', dict),
        btnSelect: t('make_pdf_look_scanned.upload.btn_select', dict),
        btnSample: t('make_pdf_look_scanned.upload.btn_sample', dict),
        hint: t('make_pdf_look_scanned.upload.hint', dict),
        btnProcess: t('make_pdf_look_scanned.btn.process', dict),
        btnDownload: t('make_pdf_look_scanned.btn.download', dict),
        btnProcessNew: t('make_pdf_look_scanned.btn.process_new', dict),
        procProcessing: t('make_pdf_look_scanned.proc.processing', dict),
        pages: t('make_pdf_look_scanned.pages', dict),
        level: t('make_pdf_look_scanned.settings.level', dict),
        settingsIntensity: t('make_pdf_look_scanned.settings.intensity', dict),
        settingsStyle: t('make_pdf_look_scanned.settings.style', dict),
        styleBw: t('make_pdf_look_scanned.style.bw', dict),
        styleGrainy: t('make_pdf_look_scanned.style.grainy', dict),
        styleVintage: t('make_pdf_look_scanned.style.vintage', dict),
        styleColor: t('make_pdf_look_scanned.style.color', dict)
    });
    
    // We just fallback to related tools for now
    let relatedTools = $derived(getRelatedTools('compress-pdf'));
</script>

<Seo title={t('make_pdf_look_scanned.seo.title', dict)} description={t('make_pdf_look_scanned.seo.description', dict)} />

<div class="hero">
    <h1>{t('make_pdf_look_scanned.hero.title', dict)}</h1>
    <p>{t('make_pdf_look_scanned.hero.description', dict)}</p>
</div>

<div class="grid">
    <main>
        <PDFLookScanner texts={scannerTexts} />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={"Related Tools"} tools={relatedTools} />
        <div class="mt-4">
            <AdsterraBanner 
                adKey="85c87dc7bfff537a2e642741cb7ba59a" 
                size="300x250" 
                reloadAfter={20}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={"Related Tools"} tools={relatedTools} mobile={true} />
</div>
