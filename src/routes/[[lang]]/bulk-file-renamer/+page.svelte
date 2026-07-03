<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import { t } from '$lib/i18n/config';
    import { getRelatedTools } from '$lib/config/tools';
    
    import BulkRename from '$lib/components/tools/BulkRename.svelte';
    import HowToUse from '$lib/components/HowToUse.svelte';
    import WhyUse from '$lib/components/WhyUse.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Donate from '$lib/components/Donate.svelte';

    let dict = $derived($page.data.dict);

    let componentTexts = $derived({
        uploadTitle: t('bulk_file_renamer.upload.title', dict),
        uploadSubtitle: t('bulk_file_renamer.upload.subtitle', dict),
        btnSelect: t('bulk_file_renamer.upload.btn_select', dict),
        btnSample: t('bulk_file_renamer.upload.btn_sample', dict),
        hint: t('bulk_file_renamer.upload.hint', dict),
        rules: t('bulk_file_renamer.rules', dict),
        add_rule: t('bulk_file_renamer.add_rule', dict),
        remove_rule: t('bulk_file_renamer.remove_rule', dict),
        rule_replace: t('bulk_file_renamer.rule_replace', dict),
        rule_add: t('bulk_file_renamer.rule_add', dict),
        rule_remove: t('bulk_file_renamer.rule_remove', dict),
        rule_format: t('bulk_file_renamer.rule_format', dict),
        rule_numbering: t('bulk_file_renamer.rule_numbering', dict),
        rule_extension: t('bulk_file_renamer.rule_extension', dict),
        
        find_text: t('bulk_file_renamer.find_text', dict),
        replace_with: t('bulk_file_renamer.replace_with', dict),
        case_sensitive: t('bulk_file_renamer.case_sensitive', dict),
        use_regex: t('bulk_file_renamer.use_regex', dict),
        
        text_to_add: t('bulk_file_renamer.text_to_add', dict),
        add_at: t('bulk_file_renamer.add_at', dict),
        prefix: t('bulk_file_renamer.prefix', dict),
        suffix: t('bulk_file_renamer.suffix', dict),
        custom_index: t('bulk_file_renamer.custom_index', dict),
        index: t('bulk_file_renamer.index', dict),
        
        remove_type: t('bulk_file_renamer.remove_type', dict),
        remove_first_n: t('bulk_file_renamer.remove_first_n', dict),
        remove_last_n: t('bulk_file_renamer.remove_last_n', dict),
        remove_range: t('bulk_file_renamer.remove_range', dict),
        chars_count: t('bulk_file_renamer.chars_count', dict),
        start_index: t('bulk_file_renamer.start_index', dict),
        end_index: t('bulk_file_renamer.end_index', dict),
        
        format_type: t('bulk_file_renamer.format_type', dict),
        lowercase: t('bulk_file_renamer.lowercase', dict),
        uppercase: t('bulk_file_renamer.uppercase', dict),
        title_case: t('bulk_file_renamer.title_case', dict),
        camel_case: t('bulk_file_renamer.camel_case', dict),
        
        start_at: t('bulk_file_renamer.start_at', dict),
        increment_by: t('bulk_file_renamer.increment_by', dict),
        padding: t('bulk_file_renamer.padding', dict),
        separator: t('bulk_file_renamer.separator', dict),
        position: t('bulk_file_renamer.position', dict),
        before_name: t('bulk_file_renamer.before_name', dict),
        after_name: t('bulk_file_renamer.after_name', dict),
        
        new_extension: t('bulk_file_renamer.new_extension', dict),
        extension_mode: t('bulk_file_renamer.extension_mode', dict),
        ext_replace: t('bulk_file_renamer.ext_replace', dict),
        ext_lower: t('bulk_file_renamer.ext_lower', dict),
        ext_upper: t('bulk_file_renamer.ext_upper', dict),
        ext_remove: t('bulk_file_renamer.ext_remove', dict),
        
        original_name: t('bulk_file_renamer.original_name', dict),
        new_name: t('bulk_file_renamer.new_name', dict),
        status: t('bulk_file_renamer.status', dict),
        status_changed: t('bulk_file_renamer.status_changed', dict),
        status_unchanged: t('bulk_file_renamer.status_unchanged', dict),
        
        download_zip: t('bulk_file_renamer.download_zip', dict),
        clear_all: t('bulk_file_renamer.clear_all', dict),
        no_files: t('bulk_file_renamer.no_files', dict),
        preview: t('bulk_file_renamer.preview', dict),
        files: t('bulk_file_renamer.files', dict),
        add_files: t('bulk_file_renamer.add_files', dict),
    });

    let relatedTools = $derived(getRelatedTools('bulk-file-renamer'));
</script>

<Seo 
    title={t('tool.bulk_file_renamer.seo.title', dict) || ''} 
    description={t('tool.bulk_file_renamer.seo.description', dict) || ''}
/>

<div class="hero">
    <h1>{t('tool.bulk_file_renamer.hero.title', dict) || ''}</h1>
    <p>{t('tool.bulk_file_renamer.hero.description', dict) || ''}</p>
</div>

<div class="grid">
    <main>
        <BulkRename texts={componentTexts} />
        
        <HowToUse 
            title={t('bulk_file_renamer.how_to_use.title', dict) || ''} 
            steps={Array.isArray(t('bulk_file_renamer.how_to_use.steps', dict)) ? t('bulk_file_renamer.how_to_use.steps', dict) : []} 
        />
        
        <WhyUse 
            title={t('bulk_file_renamer.why_use.title', dict) || ''} 
            benefits={Array.isArray(t('bulk_file_renamer.why_use.benefits', dict)) ? t('bulk_file_renamer.why_use.benefits', dict) : []} 
        />
        
        <Faq 
            title={t('bulk_file_renamer.faq.title', dict) || 'Frequently Asked Questions'} 
            items={Array.isArray(t('bulk_file_renamer.faq.items', dict)) ? t('bulk_file_renamer.faq.items', dict) : []} 
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
