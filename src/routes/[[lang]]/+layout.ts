import type { LayoutLoad } from './$types';
import { getCanonicalLang, isValidLang } from '$lib/i18n/config';
import { error, redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, url }) => {
    if (params.lang === 'en') {
        const newPath = url.pathname.replace(/^\/en/, '') || '/';
        redirect(301, newPath + url.search);
    }

    if (params.lang && !isValidLang(params.lang)) {
        error(404, 'Language not found');
    }
    
    const lang = getCanonicalLang(params.lang);

    let dict = {};
    try {
        const module = await import(`../../lib/i18n/locales/${lang}.json`);
        dict = module.default || module;
    } catch (e) {
        const module = await import(`../../lib/i18n/locales/en.json`);
        dict = module.default || module;
    }

    return {
        dict,
        lang
    };
};
