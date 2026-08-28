<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let isVisible = $state(false);

    // Default to 'en' if no lang param is present
    let currentLang = $derived($page.params.lang || 'en');

    // Languages supported by TapirConvert
    const supportedTapirLangs = ['ja', 'ko', 'zh-tw', 'pt-br'];
    
    // Generate link based on current language with UTM parameters
    let tapirLink = $derived(
        (supportedTapirLangs.includes(currentLang)
            ? `https://tapirconvert.com/${currentLang}`
            : 'https://tapirconvert.com') + '?utm_source=uploadless.app&utm_medium=popup&utm_campaign=cross_promo'
    );

    // Localized texts
    const texts: Record<string, { title: string; desc: string; cta: string }> = {
        'en': {
            title: 'Try TapirConvert',
            desc: 'Need to upscale videos & images, remove objects, or convert video formats? Check out our new tool!',
            cta: 'Try it now'
        },
        'ja': {
            title: 'TapirConvertをお試しください',
            desc: '動画や画像のアップスケール、オブジェクトの削除、動画形式の変換が必要ですか？新しいツールをチェック！',
            cta: '今すぐ試す'
        },
        'zh-tw': {
            title: '探索 TapirConvert',
            desc: '想要提升影片或圖片畫質、移除物件，或是轉換影片格式嗎？快來看看我們的新工具！',
            cta: '立即體驗'
        },
        'ko': {
            title: 'TapirConvert 사용해보기',
            desc: '비디오 및 이미지 업스케일링, 개체 제거 또는 비디오 형식 변환이 필요하신가요? 새로운 도구를 확인해 보세요!',
            cta: '지금 사용해보기'
        },
        'pt-br': {
            title: 'Conheça o TapirConvert',
            desc: 'Precisa melhorar a qualidade de vídeos e imagens, remover objetos ou converter formatos? Confira nossa nova ferramenta!',
            cta: 'Experimente agora'
        },
        'th': {
            title: 'ลองใช้ TapirConvert',
            desc: 'ต้องการเพิ่มความละเอียดวิดีโอและรูปภาพ ลบวัตถุ หรือแปลงรูปแบบวิดีโอใช่หรือไม่? ลองใช้เครื่องมือใหม่ของเรา!',
            cta: 'ลองเลย'
        }
    };

    let t = $derived(texts[currentLang] || texts['en']);

    onMount(() => {
        const timer = setTimeout(() => {
            isVisible = true;
        }, 15000);

        return () => clearTimeout(timer);
    });

    function closePopup() {
        isVisible = false;
    }
</script>

{#if isVisible}
    <div class="tapir-popup" role="dialog" aria-modal="true">
        <button class="close-btn" aria-label="Close popup" onclick={closePopup}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="popup-content">
            <h3 class="popup-title">{t.title}</h3>
            <p class="popup-desc">{t.desc}</p>
        </div>
        <a href={tapirLink} target="_blank" rel="noopener" class="cta-btn" onclick={closePopup}>
            {t.cta}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        </a>
    </div>
{/if}

<style>
    .tapir-popup {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 320px;
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--bd-lt, rgba(0, 0, 0, 0.08));
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        z-index: 9999;
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        color: var(--text-color-light, #666);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, color 0.2s;
    }

    .close-btn:hover {
        background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
        color: var(--text-color, #111);
    }

    .popup-content {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-right: 16px; /* space for close btn */
    }

    .popup-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-color, #1a1a1a);
        line-height: 1.3;
    }

    .popup-desc {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-color-light, #666);
        line-height: 1.5;
    }

    .cta-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background-color: transparent;
        color: var(--link-color, #2563eb);
        border: 1px solid var(--link-color, #2563eb);
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }

    .cta-btn:hover {
        background-color: var(--link-color, #2563eb);
        color: #ffffff;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
        .tapir-popup {
            background: var(--bg-card, #1e1e1e);
            border-color: var(--bd-lt, rgba(255, 255, 255, 0.08));
        }
        .popup-title {
            color: var(--text-color, #f0f0f0);
        }
        .popup-desc {
            color: var(--text-color-light, #a0a0a0);
        }
        .close-btn {
            color: var(--text-color-light, #a0a0a0);
        }
        .close-btn:hover {
            background-color: var(--bg-hover, rgba(255, 255, 255, 0.1));
            color: var(--text-color, #f0f0f0);
        }
        .cta-btn {
            color: var(--link-color, #60a5fa);
            border-color: var(--link-color, #60a5fa);
        }
        .cta-btn:hover {
            background-color: var(--link-color, #60a5fa);
            color: #ffffff;
        }
    }
    
    @media (max-width: 480px) {
        .tapir-popup {
            bottom: 16px;
            right: 16px;
            left: 16px;
            width: auto;
        }
    }
</style>
