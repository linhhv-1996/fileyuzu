import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCanonicalLang, langUrl } from '$lib/i18n/config';

// convert-to-wav has been merged into audio-converter (same AudioConverter tool,
// duplicate LP was cannibalizing the main page's rankings).
export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    throw redirect(301, langUrl(lang, '/audio-converter'));
};
