import type { PageLoad } from './$types';
import { enforceMarket } from '$lib/utils/route-guard';

export const load: PageLoad = async ({ parent }) => {
    const { lang } = await parent();
    
    // lang from parent is already canonical (e.g. 'ja', 'ko', 'en')
    enforceMarket(lang, ['en', 'ja', 'ko']);
    
    return {};
};
