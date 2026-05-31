<script lang="ts">
    let { title = '', steps = [] }: { title?: string, steps?: string[] } = $props();
</script>

<div class="card" style="margin-top:14px">
    <h2 class="sec-title">{title}</h2>
    <div class="sec-body">
        <div class="steps">
            {#each steps as step, i}
                <div class="step">
                    <div class="step-n">{i + 1}</div>
                    <p>{step}</p>
                </div>
            {/each}
        </div>
    </div>
</div>
