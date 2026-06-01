<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import type { ToolConfig } from '$lib/config/tools';

    let { title = '', tools = [], mobile = false }: { title?: string, tools?: ToolConfig[], mobile?: boolean } = $props();

    let dict = $derived($page.data.dict);
    let lang = $derived($page.params.lang || 'en');
</script>

<div class="card" style={mobile ? "margin-top:14px" : ""}>
    <h2 class="sb-title">{title}</h2>
    <div class="rel-list" style={mobile ? "display:grid;grid-template-columns:1fr 1fr" : ""}>
        {#each tools as tool, i}
            <a href={langUrl(lang, `/${tool.slug}`)} class="rel-item" style={mobile && i % 2 === 0 ? "border-right:1px solid var(--bd-lt)" : ""}>
                <i class="ti ti-{tool.icon}" aria-hidden="true"></i>
                <div>
                    <span class="rel-name">{t(tool.titleKey, dict)}</span>
                    <span class="rel-sub">{t(tool.shortDescriptionKey, dict)}</span>
                </div>
            </a>
        {/each}
    </div>
</div>
