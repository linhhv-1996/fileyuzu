<script lang="ts">
    import { onMount } from "svelte";

    let container: HTMLDivElement;

    onMount(() => {
        // Đẩy việc load banner ra khỏi luồng render chính của trình duyệt
        const timer = setTimeout(() => {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.text = `
                aclib.runBanner({
                    zoneId: '11688686',
                });
            `;
            if (container) {
                container.appendChild(script);
            }
        }, 500);

        return () => clearTimeout(timer);
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
