import type { LayoutLoad } from './$types';
import { SUPPORTED_LANGUAGES } from '$lib/i18n/config';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params }) => {
    const lang = params.lang || 'en';
    
    if (params.lang && !SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
        error(404, 'Language not found');
    }

    let dict = {};
    try {
        const module = await import(`../../lib/i18n/locales/${lang}.json`);
        dict = module.default || module;
    } catch (e) {
        const module = await import(`../../lib/i18n/locales/en.json`);
        dict = module.default || module;
    }

    return {
        dict
    };
};
