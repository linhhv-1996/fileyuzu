<script lang="ts">
    import { onMount } from "svelte";

    // svelte-ignore non_reactive_update
    let container: HTMLDivElement;
    let status = $state<"loading" | "loaded" | "failed">("loading");

    function waitForAclib(cb: () => void, onFail: () => void, retries = 40) {
        const ready =
            typeof (window as any).aclib !== "undefined" &&
            typeof (window as any).aclib.runBanner === "function";

        if (ready) {
            cb();
            return;
        }
        if (retries <= 0) {
            onFail();
            return;
        }
        setTimeout(() => waitForAclib(cb, onFail, retries - 1), 250);
    }

    onMount(() => {
        waitForAclib(
            () => {
                const s = document.createElement("script");
                s.type = "text/javascript";
                s.text = "aclib.runBanner({ zoneId: '11765042' });";
                container.appendChild(s);
                status = "loaded";
            },
            () => {
                console.warn("aclib.runBanner failed to load, hiding banner");
                status = "failed";
            }
        );
    });
</script>

{#if status !== "failed"}
    <div bind:this={container} class="adcash-banner-container">
        {#if status === "loading"}
            <div class="spinner"></div>
        {/if}
    </div>
{/if}

<style>
    .adcash-banner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 300px;
        height: 250px;
        margin: 0 auto;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top-color: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
