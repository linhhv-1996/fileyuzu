<script lang="ts">
    import { onMount } from "svelte";

    let container: HTMLDivElement;

    onMount(() => {
        // Tạo một thẻ script rỗng để thư viện Adcash lấy làm mốc (anchor) vị trí hiển thị
        const script = document.createElement("script");
        script.id = "adcash-marker";
        if (container) {
            container.appendChild(script);
        }

        // Gọi hàm trực tiếp thay vì chèn text vào thẻ script (tránh lỗi eval do trình duyệt soi text)
        if (typeof window !== 'undefined' && (window as any).aclib) {
            (window as any).aclib.runBanner({
                zoneId: '11688686',
            });
        }
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
