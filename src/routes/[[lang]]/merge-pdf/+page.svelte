<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import MergePDF from '$lib/components/tools/MergePDF.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';
    import YandexBanner from '$lib/components/Ads/YandexBanner.svelte';
    import { adsConfig } from '$lib/config/ads';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        uploadTitle: t('merge_pdf.upload.title', dict) || '',
        uploadSubtitle: t('merge_pdf.upload.subtitle', dict) || '',
        uploadHint: t('merge_pdf.upload.hint', dict) || '',
        btnSelect: t('merge_pdf.upload.btn_select', dict) || '',
        btnAddMore: t('merge_pdf.btn.add_more', dict) || '',
        btnProcessing: t('merge_pdf.btn.processing', dict) || '',
        btnCombine: t('merge_pdf.btn.combine', dict) || '',
        btnDownloadShort: t('merge_pdf.btn.download_short', dict) || '',
        btnConvert: t('merge_pdf.btn.convert', dict) || '',
        btnDownload: t('merge_pdf.btn.download', dict) || '',
        btnClear: t('merge_pdf.btn.clear', dict) || '',
        selectedFiles: t('merge_pdf.selected_files', dict) || '',
        previewTitle: t('merge_pdf.preview_title', dict) || '',
        btnLoadSample: t('merge_pdf.btn.load_sample', dict) || '',
        pages: t('merge_pdf.pages', dict) || ''
    });

    let relatedTools = $derived(getRelatedTools('merge-pdf'));
</script>

<Seo 
    title={t('merge_pdf.seo.title', dict) || ''} 
    description={t('merge_pdf.seo.description', dict) || ''}
/>

<div class="hero">
    <h1>{t('merge_pdf.hero.title', dict) || ''}</h1>
    <p>{t('merge_pdf.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <MergePDF texts={componentTexts} samples={['/sample_pdf.pdf', '/sample_pdf_2.pdf', '/s3.png']} />
        
        <HowToUse 
            title={t('merge_pdf.how_to_use.title', dict) || ''} 
            steps={Array.isArray(t('merge_pdf.how_to_use.steps', dict)) ? t('merge_pdf.how_to_use.steps', dict) : []} 
        />
        
        <WhyUse 
            title={t('merge_pdf.why_use.title', dict) || ''} 
            benefits={Array.isArray(t('merge_pdf.why_use.benefits', dict)) ? t('merge_pdf.why_use.benefits', dict) : []} 
        />
        
        <Faq 
            title={t('merge_pdf.faq.title', dict) || 'Frequently Asked Questions'} 
            items={Array.isArray(t('merge_pdf.faq.items', dict)) ? t('merge_pdf.faq.items', dict) : []} 
        />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <YandexBanner 
                adKey={adsConfig.yandex_banner_sidebar_home.id} 
                reloadAfter={adsConfig.yandex_banner_sidebar_home.reload_after} 
                size={adsConfig.yandex_banner_sidebar_home.size}
            />
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
