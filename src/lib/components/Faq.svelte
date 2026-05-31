<script lang="ts">
    import { formatHTML } from '$lib/utils';
    let { title = '', items = [] }: { title?: string, items?: { q: string, a: string }[] } = $props();

    let openStates = $state<boolean[]>([]);
    $effect(() => {
        if (openStates.length !== items.length) {
            openStates = items.map(() => false);
        }
    });

    function toggle(index: number) {
        openStates[index] = !openStates[index];
    }
</script>

<div class="card" style="margin-top:14px">
    <h2 class="sec-title">{title}</h2>
    <div class="faq-list">
        {#each items as item, i}
            <div class="faq-item" class:open={openStates[i]}>
                <h3 class="faq-heading">
                    <button class="faq-q" onclick={() => toggle(i)} aria-expanded={openStates[i]}>
                        {item.q}
                        <i class="ti ti-chevron-down" aria-hidden="true"></i>
                    </button>
                </h3>
                <p class="faq-a">{@html formatHTML(item.a)}</p>
            </div>
        {/each}
    </div>
</div>
