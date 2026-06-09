import type { LayoutLoad } from './$types';
import { getCanonicalLang, isValidLang } from '$lib/i18n/config';
import { error, redirect } from '@sveltejs/kit';
import { tools } from '$lib/config/tools';
import { enforceMarket } from '$lib/utils/route-guard';

export const load: LayoutLoad = async ({ params, url }) => {
    if (params.lang === 'en') {
        const newPath = url.pathname.replace(/^\/en/, '') || '/';
        redirect(301, newPath + url.search);
    }

    if (params.lang && !isValidLang(params.lang)) {
        error(404, 'Language not found');
    }
    
    const lang = getCanonicalLang(params.lang);

    // Centralized route guard for tool markets
    const pathname = url.pathname;
    let basePath = pathname;
    if (params.lang && (pathname === `/${params.lang}` || pathname.startsWith(`/${params.lang}/`))) {
        basePath = pathname.substring(params.lang.length + 1) || '/';
    }
    const slug = basePath === '/' ? '' : basePath.replace(/^\//, '');
    const toolConfig = tools.find(t => t.slug === slug);

    if (toolConfig && toolConfig.markets) {
        enforceMarket(lang, toolConfig.markets);
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
        dict,
        lang
    };
};
