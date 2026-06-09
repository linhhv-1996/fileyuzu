<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import CompareTwoLists from '$lib/components/tools/CompareTwoLists.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Donate from '$lib/components/Donate.svelte';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        listA: t('compare_two_lists.list_a', dict) || 'List A',
        placeholderA: t('compare_two_lists.placeholder_a', dict) || 'Paste items for List A here, one per line...',
        listB: t('compare_two_lists.list_b', dict) || 'List B',
        placeholderB: t('compare_two_lists.placeholder_b', dict) || 'Paste items for List B here, one per line...',
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
        
        <HowToUse 
            title={t('compare_two_lists.how_to_use.title', dict) || ''} 
            steps={Array.isArray(t('compare_two_lists.how_to_use.steps', dict)) ? t('compare_two_lists.how_to_use.steps', dict) : []} 
        />
        
        <WhyUse 
            title={t('compare_two_lists.why_use.title', dict) || ''} 
            benefits={Array.isArray(t('compare_two_lists.why_use.benefits', dict)) ? t('compare_two_lists.why_use.benefits', dict) : []} 
        />
        
        <Faq 
            title={t('compare_two_lists.faq.title', dict) || 'Frequently Asked Questions'} 
            items={Array.isArray(t('compare_two_lists.faq.items', dict)) ? t('compare_two_lists.faq.items', dict) : []} 
        />
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
