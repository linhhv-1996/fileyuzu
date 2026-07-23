<script lang="ts">
    import { onMount } from "svelte";

    let container: HTMLDivElement;

    function waitForAclib(cb: () => void, retries = 40) {
        if (typeof (window as any).aclib !== "undefined") {
            cb();
            return;
        }
        if (retries <= 0) {
            console.warn("aclib failed to load, skipping banner");
            return;
        }
        setTimeout(() => waitForAclib(cb, retries - 1), 250);
    }

    onMount(() => {
        waitForAclib(() => {
            const s = document.createElement("script");
            s.type = "text/javascript";
            s.text = "aclib.runBanner({ zoneId: '11765042' });";
            container.appendChild(s);
        });
    });
</script>

<div bind:this={container} class="adcash-banner-container"></div>

<style>
    .adcash-banner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 300px;
        height: 250px;
        margin: 0 auto;
    }
</style>
