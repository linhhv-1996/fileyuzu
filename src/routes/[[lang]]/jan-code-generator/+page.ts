import type { PageLoad } from './$types';
import { enforceMarket } from '$lib/utils/route-guard';
import { getCanonicalLang } from '$lib/i18n/config';

export const load: PageLoad = async ({ params }) => {
    const currentLang = getCanonicalLang(params.lang);
    enforceMarket(currentLang, ['ja']);
    
    return {};
};
