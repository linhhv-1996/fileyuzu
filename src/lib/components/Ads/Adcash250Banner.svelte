<script lang="ts">
    import { onMount } from "svelte";

    let container: HTMLDivElement;

    onMount(() => {
    });
</script>

<div bind:this={container} class="adcash-banner-container">
    <!-- Adcash display ads will be rendered inside this parent element -->
</div>

<style>
    .adcash-banner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 250px;
        height: 250px;
        margin: 0 auto;
    }
</style>
