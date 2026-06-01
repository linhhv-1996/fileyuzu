<script lang="ts">
    import { page } from '$app/stores';
    import { langUrl, t } from '$lib/i18n/config';

    let { data } = $props();
    let lang = $derived($page.params.lang || 'en');
    let dict = $derived($page.data.dict);
</script>

<svelte:head>
    <title>Blog - FileYuzu</title>
    <meta name="description" content="Read the latest articles on FileYuzu." />
</svelte:head>

<main class="blog-page">
    <div class="blog-wrap">

        <!-- Header -->
        <header class="blog-header">
            <h1 class="blog-title">{t('common.blog', dict) || 'Blog'}</h1>
            <p class="blog-subtitle">Tips, guides and updates from the FileYuzu team.</p>
        </header>

        {#if data.posts.length === 0}
            <p class="empty">No blog posts found.</p>
        {:else}
            <div class="post-grid">
                {#each data.posts as post}
                    <a href={langUrl(lang, `/blog/${post.slug}`)} class="post-card">
                        <div class="card-content">
                            <h2 class="post-title">{post.title}</h2>
                            {#if post.description}
                                <p class="post-excerpt">{post.description}</p>
                            {/if}
                        </div>
                        <div class="card-footer">
                            <time class="post-date">
                                {new Date(post.date).toLocaleDateString('en-CA')}
                            </time>
                            <span class="post-arrow"><i class="ti ti-arrow-right"></i></span>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}

    </div>
</main>

<style>

    .blog-wrap {
        max-width: 1100px;
        margin: 0 auto;
    }

    /* ── Header ── */
    .blog-header {
        margin-bottom: 3rem;
        text-align: left;
    }

    .blog-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text);
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.02em;
        line-height: 1.2;
    }

    .blog-subtitle {
        font-size: 1.1rem;
        color: var(--text-mut);
        margin: 0;
        line-height: 1.5;
    }

    /* ── Post Grid ── */
    .post-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 12px;
    }

    /* ── Post Card ── */
    .post-card {
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border: 1px solid #e6e6e6;
        border-radius: 12px;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s;
        height: 100%;
    }

    .post-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
        border-color: #c0c0c0;
    }

    /* ── Card Content ── */
    .card-content {
        flex: 1;
        margin-bottom: 1.5rem;
    }

    .post-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 0.75rem 0;
        line-height: 1.4;
        letter-spacing: -0.01em;
        transition: color 0.15s;
    }

    .post-card:hover .post-title {
        color: var(--primary);
    }

    .post-excerpt {
        font-size: 0.95rem;
        color: var(--text-mut);
        margin: 0;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* ── Card Footer ── */
    .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
    }

    .post-date {
        font-size: 0.875rem;
        color: var(--text-mut);
        font-weight: 500;
    }

    .post-arrow {
        font-size: 1.2rem;
        color: var(--text-mut);
        transition: color 0.15s, transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .post-card:hover .post-arrow {
        color: var(--primary);
        transform: translateX(4px);
    }

    /* ── Empty ── */
    .empty {
        padding: 4rem 0;
        text-align: left;
        color: var(--text-mut);
        font-size: 1rem;
    }

    /* ── Mobile ── */
    @media (max-width: 600px) {
        .blog-page {
            padding: 0;
        }

        .blog-title {
            font-size: 2rem;
        }
        
        .post-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
