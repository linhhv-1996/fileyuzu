<script lang="ts">
    import badges from '$lib/config/badges.json';

    type Badge = {
        name: string;
        href: string;
        title: string;
        img: string;
        alt: string;
        width: number;
        height: number;
    };

    const HEIGHT = 30;
    const list = badges as Badge[];
</script>

{#if list.length}
    <div class="badges">
        <div class="badges-track">
            {#each list as b (b.href)}
                <a href={b.href} title={b.title} target="_blank" rel="noopener">
                    <img
                        src={b.img}
                        alt={b.alt}
                        height={HEIGHT}
                        width={Math.round((b.width / b.height) * HEIGHT)}
                        loading="lazy"
                        decoding="async"
                    />
                </a>
            {/each}
        </div>
    </div>
{/if}

<style>
    .badges {
        max-width: 800px;
        width: 100%;
        margin: 1rem auto 0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
        -webkit-overflow-scrolling: touch;
    }
    .badges-track {
        display: flex;
        gap: 0.75rem;
        width: max-content;
        margin: 0 auto;
        padding-bottom: 4px;
    }
    .badges a {
        flex: 0 0 auto;
        display: block;
        line-height: 0;
    }
    .badges img {
        height: 30px;
        width: auto;
        display: block;
    }
</style>
