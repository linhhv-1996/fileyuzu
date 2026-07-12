<script lang="ts">
    import { page } from '$app/stores';
    import Icon from '@iconify/svelte';
    import { t } from '$lib/i18n/config';

    let { title = 'Check this out!' } = $props();
    let url = $derived($page.url.href);
    let dict = $derived($page.data.dict);

    let links = $derived([
        {
            name: 'X (Twitter)',
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            color: '#000000',
            icon: 'simple-icons:x'
        },
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: '#1877F2',
            icon: 'simple-icons:facebook'
        },
        {
            name: 'Reddit',
            href: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
            color: '#FF4500',
            icon: 'simple-icons:reddit'
        },
        {
            name: 'WhatsApp',
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
            color: '#25D366',
            icon: 'simple-icons:whatsapp'
        },
        {
            name: 'Threads',
            href: `https://threads.net/intent/post?text=${encodeURIComponent(title + " " + url)}`,
            color: '#000000',
            icon: 'simple-icons:threads'
        },
        {
            name: 'Quora',
            href: `https://www.quora.com/`, 
            color: '#B92B27',
            icon: 'simple-icons:quora'
        }
    ]);
</script>

<div class="share-container">
    <div class="share-inner">
        <span class="share-label">{t('share.title', dict)}</span>
        <div class="share-icons">
            {#each links as link}
                <a href={link.href} target="_blank" rel="noopener noreferrer" class="share-btn" title={link.name} aria-label={`Share on ${link.name}`}>
                    <span class="icon-wrapper" style="--btn-color: {link.color}">
                        <Icon icon={link.icon} width="100%" height="100%" />
                    </span>
                </a>
            {/each}
        </div>
    </div>
</div>

<style>
    .share-inner {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .share-label {
        font-weight: 600;
        color: var(--text-color, #333);
        font-size: 12px;
    }

    .share-icons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .share-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        color: white;
        transition: transform 0.2s ease, opacity 0.2s ease;
        text-decoration: none;
    }

    .share-btn:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: var(--border-color, #e5e7eb);
        color: var(--text-secondary, #4b5563);
        padding: 8px;
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .share-btn:hover .icon-wrapper {
        background-color: var(--btn-color);
        color: white;
    }

    :global(.dark) .icon-wrapper {
        background-color: var(--border-color, #374151);
        color: var(--text-secondary, #9ca3af);
    }

    @media (max-width: 768px) {
        .share-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
    }
</style>
