import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCanonicalLang, langUrl } from '$lib/i18n/config';

// webm-to-mp4 has been merged into video-converter (same generic converter tool,
// duplicate/templated content across format-specific URLs was flagged as thin/doorway content).
export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    throw redirect(301, langUrl(lang, '/video-converter'));
};
