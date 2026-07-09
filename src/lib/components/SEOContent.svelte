<script lang="ts">
    let { content = '' }: { content?: string } = $props();
</script>

{#if content}
    <div class="seo-separator"></div>
    <div class="seo-wrapper">
        <div class="article-content">
            {@html content}
        </div>
    </div>
{/if}

<style>
    .seo-separator {
        width: 60px;
        height: 2px;
        background-color: var(--bd, #e5e7eb);
        border-radius: 2px;
        margin: 48px auto 0;
    }

    .seo-wrapper {
        margin-top: 32px; /* Reduced from 40px since separator takes up space */
        margin-bottom: 40px;
    }

    /* ── Article Content (Copied from Blog for consistency) ── */
    .article-content {
        color: var(--tx);
        font-size: 15px;
        line-height: 1.5;
    }

    :global(.article-content h2) {
        font-size: 19px;
        font-weight: 700;
        color: var(--tx);
        margin: 1rem 0 1rem 0;
        letter-spacing: -0.02em;
        line-height: 1.3;
    }

    :global(.article-content h3) {
        font-size: 16px;
        font-weight: 700;
        color: var(--tx);
        margin: 1.5rem 0 0.75rem 0;
        letter-spacing: -0.01em;
        line-height: 1.4;
    }

    :global(.article-content h4) {
        font-size: 15px;
        font-weight: 700;
        color: var(--tx);
        margin: 1.25rem 0 0.5rem 0;
        line-height: 1.5;
    }

    :global(.article-content p) {
        margin: 0 0 1.25rem 0;
        color: var(--tx);
    }

    :global(.article-content > blockquote > p) {
        margin-bottom: 0;
    }

    :global(.article-content ul),
    :global(.article-content ol) {
        margin: 0 0 1.25rem 0;
        padding-left: 1.5rem;
    }

    :global(.article-content li) {
        margin-bottom: 0.5rem;
        line-height: 1.5;
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

    :global(.article-content code) {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        background: var(--surface, rgba(0,0,0,0.06));
        padding: 0.2em 0.4em;
        border-radius: 4px;
        color: var(--tx);
    }

    :global(.article-content pre) {
        background: var(--surface, rgba(0,0,0,0.06));
        border: 1px solid var(--bd);
        border-radius: 12px;
        padding: 1.25rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.9em;
        line-height: 1.5;
    }

    :global(.article-content pre code) {
        background: none;
        padding: 0;
        font-size: inherit;
    }

    :global(.article-content blockquote) {
        border-left: 4px solid var(--ac);
        margin: 1.5rem 0;
        padding: 1rem 0 1rem 1.5rem;
        color: var(--tx-sub);
        font-style: italic;
        background: linear-gradient(to right, var(--bg), transparent);
        border-radius: 0 8px 8px 0;
    }

    :global(.article-content hr) {
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 1.5rem 0;
    }
</style>
