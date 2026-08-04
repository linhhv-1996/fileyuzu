<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import HEICConverter from '$lib/components/tools/HEICConverter.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
        
    let dict = $derived($page.data.dict);
    
    let converterTexts = $derived({
        'heic_converter.title': t('heic_converter.title', dict),
        'heic_converter.upload.title': t('heic_converter.upload.title', dict),
        'heic_converter.upload.subtitle': t('heic_converter.upload.subtitle', dict),
        'heic_converter.upload.btn_select': t('heic_converter.upload.btn_select', dict),
        'heic_converter.upload.hint': t('heic_converter.upload.hint', dict),
        'heic_converter.settings.max_width': t('heic_converter.settings.max_width', dict),
        'heic_converter.settings.format': t('heic_converter.settings.format', dict),
        'heic_converter.btn.add_more': t('heic_converter.btn.add_more', dict),
        'heic_converter.btn.clear': t('heic_converter.btn.clear', dict),
        'heic_converter.btn.convert': t('heic_converter.btn.convert', dict),
        'heic_converter.btn.converting': t('heic_converter.btn.converting', dict),
        'heic_converter.btn.download': t('heic_converter.btn.download', dict),
        'heic_converter.btn.download_all': t('heic_converter.btn.download_all', dict),
        'heic_converter.btn.load_sample': t('heic_converter.btn.load_sample', dict),
        'heic_converter.status.pending': t('heic_converter.status.pending', dict),
        'heic_converter.status.converting': t('heic_converter.status.converting', dict),
        'heic_converter.status.done': t('heic_converter.status.done', dict),
        'heic_converter.status.error': t('heic_converter.status.error', dict),
        'heic_converter.btn.convert_new': t('heic_converter.btn.convert_new', dict),
        'heic_converter.pages': t('heic_converter.pages', dict),
        'heic_converter.btn.zip': t('heic_converter.btn.zip', dict),
    });
    
    let relatedTools = $derived(getRelatedTools('heic-converter'));
</script>

<Seo 
    title={t('heic_converter.seo.title', dict) || ''} 
    description={t('heic_converter.seo.description', dict) || ''} 
/>

<div class="hero">
    <h1>{t('heic_converter.hero.title', dict) || ''}</h1>
    <p>{t('heic_converter.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <HEICConverter texts={converterTexts} />
        <SEOContent content={$page.data.seoContent} />
    </main>

    <aside class="sidebar">        
        {#if relatedTools.length > 0}
            <RelatedTools tools={relatedTools} />
        {/if}
    </aside>
</div>
