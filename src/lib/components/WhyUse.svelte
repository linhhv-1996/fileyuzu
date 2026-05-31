<script lang="ts">
    let { title = '', benefits = [] }: { title?: string, benefits?: { icon: string, title: string, description: string }[] } = $props();
</script>

<div class="card" style="margin-top:14px">
    <h2 class="sec-title">{title}</h2>
    <div class="benefit-grid">
        {#each benefits as benefit}
            <div class="benefit-item">
                <i class="ti ti-{benefit.icon}" aria-hidden="true"></i>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
            </div>
        {/each}
    </div>
</div>
