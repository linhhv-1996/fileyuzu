<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import Image2PDF from '$lib/components/tools/Image2PDF.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        uploadTitle: t('jpg_to_pdf.upload.title', dict) || '',
        uploadSubtitle: t('jpg_to_pdf.upload.subtitle', dict) || '',
        btnSelect: t('jpg_to_pdf.upload.btn_select', dict) || '',
        btnAddMore: t('jpg_to_pdf.btn.add_more', dict) || '',
        btnProcessing: t('jpg_to_pdf.btn.processing', dict) || '',
        btnCombine: t('jpg_to_pdf.btn.combine', dict) || '',
        btnDownloadShort: t('jpg_to_pdf.btn.download_short', dict) || '',
        btnConvert: t('jpg_to_pdf.btn.convert', dict) || '',
        btnDownload: t('jpg_to_pdf.btn.download', dict) || '',
        btnClear: t('jpg_to_pdf.btn.clear', dict) || '',
        selectedImages: t('jpg_to_pdf.selected_images', dict) || '',
        previewTitle: t('jpg_to_pdf.preview_title', dict) || '',
        btnLoadSample: t('jpg_to_pdf.btn.load_sample', dict) || '',
        pages: t('jpg_to_pdf.pages', dict) || ''
    });

    let relatedTools = $derived(getRelatedTools('jpg-to-pdf'));
</script>

<Seo 
    title={t('jpg_to_pdf.seo.title', dict) || ''} 
    description={t('jpg_to_pdf.seo.description', dict) || ''}
/>

<div class="hero">
    <h1>{t('jpg_to_pdf.hero.title', dict) || ''}</h1>
    <p>{t('jpg_to_pdf.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <Image2PDF texts={componentTexts} samples={['/s1.jpg', '/s2.jpg', '/s3.jpg']} />
        
        <HowToUse 
            title={t('jpg_to_pdf.how_to_use.title', dict) || ''} 
            steps={Array.isArray(t('jpg_to_pdf.how_to_use.steps', dict)) ? t('jpg_to_pdf.how_to_use.steps', dict) : []} 
        />
        
        <WhyUse 
            title={t('jpg_to_pdf.why_use.title', dict) || ''} 
            benefits={Array.isArray(t('jpg_to_pdf.why_use.benefits', dict)) ? t('jpg_to_pdf.why_use.benefits', dict) : []} 
        />
        
        <Faq 
            title={t('jpg_to_pdf.faq.title', dict) || 'Frequently Asked Questions'} 
            items={Array.isArray(t('jpg_to_pdf.faq.items', dict)) ? t('jpg_to_pdf.faq.items', dict) : []} 
        />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <div class="mt-4">
            <Affiliate offer="nordvpn" />
        </div>
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
