<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';

    let { data } = $props();
</script>

<Seo title="{data.title} - UploadLess" noIndex={true} />

<main class="article-page">
    <div class="article-container">
        <article class="article-main">
            <header class="article-header">
                <h1 class="article-title">{data.title}</h1>
            </header>

            <hr class="article-divider" />

            <div class="article-content">
                {@html data.content}
            </div>
        </article>
    </div>
</main>

<style>
    .article-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .article-header {
        margin-bottom: 2rem;
    }

    .article-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--tx);
        margin: 0 0 1rem 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }

    .article-divider {
        border: none;
        border-top: 2px solid var(--bd);
        margin: 1.5rem 0;
    }

    .article-content {
        color: var(--tx);
        font-size: 1.05rem;
        line-height: 1.8;
    }

    :global(.article-content h2) {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--tx);
        margin: 2rem 0 1rem 0;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    :global(.article-content h3) {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--tx);
        margin: 1.5rem 0 0.75rem 0;
        letter-spacing: -0.01em;
        line-height: 1.4;
    }

    :global(.article-content p) {
        margin: 0 0 1.25rem 0;
        color: var(--tx);
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
        color: #2465cb;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s;
    }

    :global(.article-content strong) {
        font-weight: 700;
        color: var(--tx);
    }
</style>
