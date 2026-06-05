<script lang="ts">
    import { getContext } from 'svelte';
    import { t } from '$lib/i18n/config';
    
    // Accept dict to easily translate texts, if not provided will use the context dictionary
    let { dict = undefined }: { dict?: any } = $props();

    const contextDict = getContext('dict');
    let currentDict = $derived(dict || contextDict);

    // Replace with your actual Ko-fi link
    const kofiLink = "https://ko-fi.com/jjjulian"; 
</script>

<div class="donate-container">
    <div class="donate-card">
        <h3 class="donate-title">{t('donate.title', currentDict)}</h3>
        <p class="donate-description">
            {t('donate.description', currentDict)}
        </p>
        
        <a href={kofiLink} target="_blank" rel="noopener noreferrer" class="donate-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="kofi-icon">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
            <span>{t('donate.button', currentDict)}</span>
        </a>
    </div>
</div>

<style>
    .donate-container {
        margin-top: 0px;
        position: relative;
    }

    .donate-card {
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--bd-lt, rgba(0, 0, 0, 0.08));
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .donate-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #29ABE0, #FF5E5B);
        opacity: 0.9;
    }

    .donate-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(41, 171, 224, 0.15);
        border-color: rgba(41, 171, 224, 0.2);
    }

    .donate-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-color, #1a1a1a);
        margin: 0 0 6px 0;
        font-family: inherit;
    }

    .donate-description {
        font-size: 0.85rem;
        color: var(--text-color-light, #666666);
        line-height: 1.5;
        margin: 0 0 14px 0;
    }

    .donate-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: transparent;
        color: #29ABE0;
        border: 2px solid #29ABE0;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.25s ease;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
    }

    .kofi-icon {
        transition: transform 0.2s ease;
    }

    .donate-btn:hover {
        background-color: #29ABE0;
        color: #ffffff;
        box-shadow: 0 6px 16px rgba(41, 171, 224, 0.25);
    }

    .donate-btn:hover .kofi-icon {
        transform: scale(1.1) rotate(5deg);
    }

    .donate-btn:active {
        transform: scale(0.98);
    }
    
    /* Auto detect dark mode fallback if CSS vars are not perfectly mapped */
    @media (prefers-color-scheme: dark) {
        .donate-card {
            background: var(--bg-card, #1e1e1e);
            border-color: var(--bd-lt, rgba(255, 255, 255, 0.08));
        }
        .donate-title {
            color: var(--text-color, #f0f0f0);
        }
        .donate-description {
            color: var(--text-color-light, #a0a0a0);
        }
    }
</style>
