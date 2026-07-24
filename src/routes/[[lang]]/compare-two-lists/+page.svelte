<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import CompareTwoLists from '$lib/components/tools/CompareTwoLists.svelte';
    import SEOContent from '$lib/components/SEOContent.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Affiliate from '$lib/components/Affiliate.svelte';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        listA: t('compare_two_lists.list_a', dict) || 'List A',
        placeholderA: t('compare_two_lists.placeholder_a', dict) || 'Paste items for List A here, one per line...',
        listB: t('compare_two_lists.list_b', dict) || 'List B',
        placeholderB: t('compare_two_lists.placeholder_b', dict) || 'Paste items for List B here, one per line...',
        btnUpload: t('compare_two_lists.btn_upload', dict) || 'Upload',
        trimWhitespace: t('compare_two_lists.trim_whitespace', dict) || 'Trim Whitespace',
        ignoreCase: t('compare_two_lists.ignore_case', dict) || 'Ignore Case',
        btnCompare: t('compare_two_lists.btn_compare', dict) || 'Compare Lists',
        btnCompareNew: t('compare_two_lists.btn_compare_new', dict) || 'Compare new lists',
        onlyA: t('compare_two_lists.only_a', dict) || 'Only in A',
        onlyB: t('compare_two_lists.only_b', dict) || 'Only in B',
        inBoth: t('compare_two_lists.in_both', dict) || 'In Both',
        allUnique: t('compare_two_lists.all_unique', dict) || 'All Unique',
        duplicatesA: t('compare_two_lists.duplicates_a', dict) || 'Duplicates A',
        duplicatesB: t('compare_two_lists.duplicates_b', dict) || 'Duplicates B',
        btnCopy: t('compare_two_lists.btn_copy', dict) || 'Copy to Clipboard',
        firstRowIsHeader: t('compare_two_lists.first_row_is_header', dict) || 'First row is header',
        allColumns: t('compare_two_lists.all_columns', dict) || 'All Columns',
    });

    let relatedTools = $derived(getRelatedTools('compare-two-lists'));
</script>

<Seo 
    title={t('tool.compare_two_lists.seo.title', dict) || ''} 
    description={t('tool.compare_two_lists.seo.description', dict) || ''}
/>

<div class="hero">
    <h1>{t('tool.compare_two_lists.hero.title', dict) || ''}</h1>
    <p>{t('tool.compare_two_lists.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <CompareTwoLists texts={componentTexts} />
        
        <SEOContent content={$page.data.seoContent} />
    </main>

    <!-- SIDEBAR (desktop only via CSS) -->
    <aside class="sidebar">
        <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} />
        <div class="mt-4">
            <!-- Ads -->
        </div>
    </aside>
</div>

<!-- SIDEBAR MOBILE (below main content on mobile) -->
<div class="sidebar-mobile">
    <RelatedTools title={t('related_tools.title', dict)} tools={relatedTools} mobile={true} />
</div>
