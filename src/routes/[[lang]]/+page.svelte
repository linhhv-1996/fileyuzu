<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';
    import { tools, categories } from '$lib/config/tools';

    let dict = $derived($page.data.dict);
    let lang = $derived($page.params.lang || 'en');

    // Group tools by category, preserving categories order
    let grouped = $derived(
        categories.map(cat => ({
            ...cat,
            label: t(cat.labelKey, dict),
            items: tools.filter(tool => tool.category === cat.id),
        })).filter(g => g.items.length > 0)
    );
</script>

<svelte:head>
    <title>{t('home.seo.title', dict)}</title>
    <meta name="description" content={t('home.seo.description', dict)}>
</svelte:head>

<!-- Hero -->
<section class="hero">
    <h1>{t('home.hero.title', dict)}</h1>
    <p>{t('home.hero.description', dict)}</p>

    <div class="trust-pills">
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {t('home.pill.private', dict)}
        </span>
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {t('home.pill.instant', dict)}
        </span>
        <span class="pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            {t('home.pill.free', dict)}
        </span>
    </div>
</section>

<!-- Categories grid -->
<section class="cats-section">
    <div class="cats-grid">
        {#each grouped as group}
            <div class="cat-box">
                <div class="cat-header">
                    <span class="cat-name">{group.label.toUpperCase()}</span>
                    <span class="cat-count">{group.items.length}</span>
                </div>
                <div class="cat-tools">
                    {#each group.items as tool, i}
                        <a href={langUrl(lang, `/${tool.slug}`)} class="tool-row">
                            <div class="tool-row-main">
                                <span class="tool-row-title">{t(tool.titleKey, dict)}</span>
                                <span class="tool-row-desc">{t(tool.descriptionKey, dict)}</span>
                            </div>
                            {#if tool.tags && tool.tags.length > 0}
                                <div class="tool-row-tags">
                                    {#each tool.tags as tag}
                                        <span class="fmt-tag">{tag}</span>
                                    {/each}
                                </div>
                            {/if}
                            <i class="ti ti-chevron-right row-arrow" aria-hidden="true"></i>
                        </a>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</section>

<!-- Why section — 3 cards -->
<section class="why-section">
    <div class="why-grid">
        <div class="why-card">
            <div class="why-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <strong>{t('home.why.private.title', dict)}</strong>
            <p>{t('home.why.private.desc', dict)}</p>
        </div>
        <div class="why-card">
            <div class="why-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <strong>{t('home.why.instant.title', dict)}</strong>
            <p>{t('home.why.instant.desc', dict)}</p>
        </div>
        <div class="why-card">
            <div class="why-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <strong>{t('home.why.device.title', dict)}</strong>
            <p>{t('home.why.device.desc', dict)}</p>
        </div>
    </div>
</section>

<!-- FAQ -->
<section class="faq-section">
    <h2>{t('home.faq.title', dict)}</h2>
    <div class="faq-list">
        {#each Array.isArray(t('home.faq.items', dict)) ? t('home.faq.items', dict) : [] as item}
            <div class="faq-item">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
            </div>
        {/each}
    </div>
</section>

<style>
    /* ── Hero ── */
    .hero {
        padding: 0px 0 40px;
        text-align: left;
    }

    .hero h1 {
        font-size: clamp(24px, 4vw, 36px);
        font-weight: 700;
        color: var(--tx);
        margin-bottom: 12px;
        line-height: 1.15;
        letter-spacing: -0.02em;
    }

    .hero p {
        font-size: 15.5px;
        color: var(--tx-sub);
        max-width: 520px;
        margin: 0 0 24px;
        line-height: 1.6;
    }

    .trust-pills {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12.5px;
        color: var(--tx-sub);
        background: var(--bg-sub);
        border: 1px solid var(--bd-lt);
        border-radius: 999px;
        padding: 4px 12px;
    }

    .pill svg {
        color: var(--green);
        flex-shrink: 0;
    }

    /* ── Categories grid ── */
    .cats-section {
        margin-bottom: 30px;
    }

    .cats-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        align-items: start;
    }

    @media (max-width: 640px) {
        .cats-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Category box */
    .cat-box {
        border: 1px solid var(--bd);
        border-radius: 10px;
        overflow: hidden;
        background: var(--bg);
    }

    .cat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 16px;
        background: var(--bg-sub);
        border-bottom: 1px solid var(--bd);
    }

    .cat-name {
        font-size: 12px;
        font-weight: 700;
        color: var(--tx-sub);
        letter-spacing: 0.06em;
    }

    .cat-count {
        font-size: 12px;
        color: var(--tx-mt);
        background: var(--bg);
        border: 1px solid var(--bd-lt);
        border-radius: 999px;
        padding: 1px 8px;
        font-weight: 500;
    }

    .cat-tools {
        display: flex;
        flex-direction: column;
    }

    /* Tool row */
    .tool-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid var(--bd-lt);
        transition: background 0.12s;
        position: relative;
    }

    .tool-row:last-child {
        border-bottom: none;
    }

    .tool-row:hover {
        background: var(--bg-sub);
        text-decoration: none;
    }

    .tool-row-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .tool-row-title {
        font-size: 14px;
        font-weight: 650;
        color: var(--tx);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tool-row-desc {
        font-size: 12.5px;
        color: var(--tx-sub);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Format tags */
    .tool-row-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .fmt-tag {
        font-size: 11px;
        font-weight: 500;
        color: var(--tx-mt);
        border: 1px solid var(--bd-lt);
        border-radius: 4px;
        padding: 2px 6px;
        background: var(--bg-sub);
        white-space: nowrap;
    }

    .row-arrow {
        font-size: 14px;
        color: var(--tx-mt);
        flex-shrink: 0;
        transition: transform 0.12s, color 0.12s;
    }

    .tool-row:hover .row-arrow {
        color: var(--ac);
        transform: translateX(2px);
    }

    /* ── Why — 3 cards ── */
    .why-section {
        border-top: 1px solid var(--bd-lt);
        padding: 32px 0;
        margin-bottom: 0;
    }

    .why-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        border: 1px solid var(--bd);
        border-radius: 10px;
        overflow: hidden;
    }

    @media (max-width: 640px) {
        .why-grid {
            grid-template-columns: 1fr;
        }
        .why-card:not(:last-child) {
            border-bottom: 1px solid var(--bd);
            border-right: none !important;
        }
    }

    .why-card {
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--bg);
    }

    .why-card:not(:last-child) {
        border-right: 1px solid var(--bd);
    }

    .why-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: var(--ac-soft);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--ac);
        margin-bottom: 4px;
    }

    .why-card strong {
        display: block;
        font-size: 13.5px;
        font-weight: 650;
        color: var(--tx);
    }

    .why-card p {
        margin: 0;
        font-size: 13px;
        color: var(--tx-sub);
        line-height: 1.55;
    }

    /* ── FAQ — full-width, 1 per row ── */
    .faq-section {
        border-top: 1px solid var(--bd-lt);
        padding: 36px 0 20px;
    }

    .faq-section h2 {
        font-size: 16px;
        font-weight: 650;
        color: var(--tx);
        margin: 0 0 20px;
    }

    .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--bd);
        border-radius: 10px;
        overflow: hidden;
    }

    .faq-item {
        padding: 16px 20px;
        border-bottom: 1px solid var(--bd-lt);
    }

    .faq-item:last-child {
        border-bottom: none;
    }

    .faq-item h3 {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--tx);
        margin: 0 0 5px;
        line-height: 1.4;
    }

    .faq-item p {
        margin: 0;
        font-size: 13px;
        color: var(--tx-sub);
        line-height: 1.6;
    }
</style>
