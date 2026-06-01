<script lang="ts">
    import { page } from '$app/stores';
    import { t, langUrl } from '$lib/i18n/config';

    let { data } = $props();
    let dict = $derived($page.data.dict);
    let lang = $derived($page.params.lang || 'en');
</script>

<svelte:head>
    <title>{data.title} - FileYuzu</title>
    {#if data.description}
        <meta name="description" content={data.description} />
    {/if}
</svelte:head>

<main class="article-page">
    <div class="article-container">
        <!-- Back nav -->
        <nav class="back-nav" aria-label="Breadcrumb">
            <a href={langUrl(lang, '/blog')} class="back-link">
                <i class="ti ti-arrow-left"></i>
                {t('common.blog', dict) || 'Blog'}
            </a>
        </nav>

        <div class="article-grid">
            <!-- Left Column: Article -->
            <article class="article-main">
                <!-- Article header -->
                <header class="article-header">
                    <div class="article-meta">
                        <time class="article-date">
                            {new Date(data.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span class="meta-sep">·</span>
                        <span class="article-author">FileYuzu Team</span>
                    </div>
                    <h1 class="article-title">{data.title}</h1>
                    {#if data.description}
                        <p class="article-description">{data.description}</p>
                    {/if}
                </header>

                <!-- Divider -->
                <hr class="article-divider" />

                <!-- Content -->
                <div class="article-content">
                    {@html data.content}
                </div>

            </article>

            <!-- Right Column: Sidebar -->
            <aside class="article-sidebar">
                <div class="author-card">
                    <h3 class="author-name">FileYuzu Team</h3>
                    <p class="author-bio">We build free and fast tools to make your digital life easier. No installations, no limits, just simple utilities right in your browser.</p>
                    <div class="author-social">
                        <a href="#" class="social-link"><i class="ti ti-brand-twitter"></i></a>
                        <a href="#" class="social-link"><i class="ti ti-brand-github"></i></a>
                        <a href="#" class="social-link"><i class="ti ti-link"></i></a>
                    </div>
                </div>
            </aside>
        </div>

    </div>
</main>

<style>

    .article-container {
        max-width: 1100px;
        margin: 0 auto;
    }

    /* ── Back Nav ── */
    .back-nav {
        margin-bottom: 2rem;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--text-mut);
        text-decoration: none;
        transition: color 0.15s ease, transform 0.2s ease;
    }

    .back-link:hover {
        color: var(--primary);
        transform: translateX(-3px);
    }

    .back-link i {
        font-size: 1.1rem;
    }

    /* ── Article Grid ── */
    .article-grid {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 15px;
        align-items: start;
    }

    .article-main {
        min-width: 0;
    }

    /* ── Article Header ── */
    .article-header {
        margin-bottom: 2rem;
    }

    .article-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--primary);
    }

    .meta-sep {
        color: var(--text-mut);
        font-weight: 400;
    }

    .article-author {
        color: var(--text-mut);
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0;
    }

    .article-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text);
        margin: 0 0 1rem 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }

    .article-description {
        font-size: 1.1rem;
        color: var(--text-mut);
        margin: 0;
        line-height: 1.6;
    }

    /* ── Divider ── */
    .article-divider {
        border: none;
        border-top: 2px solid var(--border);
        margin: 2.5rem 0;
    }

    /* ── Article Content ── */
    .article-content {
        color: var(--text);
        font-size: 1.05rem;
        line-height: 1.8;
    }

    :global(.article-content h2) {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text);
        margin: 2rem 0 1rem 0;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    :global(.article-content h3) {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text);
        margin: 1.5rem 0 0.75rem 0;
        letter-spacing: -0.01em;
        line-height: 1.4;
    }

    :global(.article-content h4) {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text);
        margin: 1.25rem 0 0.5rem 0;
        line-height: 1.5;
    }

    :global(.article-content p) {
        margin: 0 0 1.25rem 0;
        color: var(--text);
    }

    :global(.article-content ul),
    :global(.article-content ol) {
        margin: 0 0 1.25rem 0;
        padding-left: 1.5rem;
    }

    :global(.article-content li) {
        margin-bottom: 0.5rem;
        line-height: 1.7;
    }

    :global(.article-content a) {
        color: var(--primary);
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s;
    }

    :global(.article-content a:hover) {
        text-decoration: none;
        color: var(--primary-hover, var(--primary));
    }

    :global(.article-content strong) {
        font-weight: 700;
        color: var(--text);
    }

    :global(.article-content code) {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 0.875em;
        background: var(--surface, rgba(0,0,0,0.06));
        padding: 0.15em 0.4em;
        border-radius: 4px;
        color: var(--text);
    }

    :global(.article-content pre) {
        background: var(--surface, rgba(0,0,0,0.06));
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.5rem;
        overflow-x: auto;
        margin: 0 0 1.25rem 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    :global(.article-content pre code) {
        background: none;
        padding: 0;
        font-size: inherit;
    }

    :global(.article-content blockquote) {
        border-left: 4px solid var(--primary);
        margin: 1.5rem 0;
        padding: 0.75rem 0 0.75rem 1.5rem;
        color: var(--text-mut);
        font-style: italic;
        background: linear-gradient(to right, var(--surface), transparent);
        border-radius: 0 8px 8px 0;
    }

    :global(.article-content hr) {
        border: none;
        border-top: 1px solid var(--border);
        margin: 2rem 0;
    }

    :global(.article-content img) {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 1.5rem 0;
        border: 1px solid var(--border);
    }

    /* ── Sidebar & Author Card ── */
    .article-sidebar {
        position: sticky;
        top: 6rem;
    }

    .author-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 2rem;
        text-align: left;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .author-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 0.75rem 0;
        letter-spacing: -0.01em;
    }

    .author-bio {
        font-size: 0.95rem;
        color: var(--text-mut);
        line-height: 1.6;
        margin: 0 0 1.5rem 0;
    }

    .author-social {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.75rem;
    }

    .social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text-mut);
        font-size: 1.1rem;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    .social-link:hover {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
        transform: translateY(-2px);
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
        .article-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .article-sidebar {
            position: static;
        }

        .author-card {
            text-align: left;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
        }

        .author-name {
            margin-bottom: 0.25rem;
        }

        .author-bio {
            margin-bottom: 0;
        }
        
        .author-social {
            display: none; /* Hide social links in horizontal layout to keep it clean, or could place them elsewhere */
        }
    }

    @media (max-width: 640px) {

        .article-title {
            font-size: 2rem;
        }
        
        .author-card {
            flex-direction: column;
            text-align: left;
            padding: 2rem 1.5rem;
            align-items: flex-start;
        }
        
        .author-bio {
            margin-bottom: 1rem;
        }
        
        .author-social {
            display: flex;
        }
    }
</style>
