import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCanonicalLang, langUrl } from '$lib/i18n/config';

// reduce-video-size has been merged into compress-video (same underlying tool,
// duplicate/templated content across the two URLs was flagged as thin/doorway content).
export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    throw redirect(301, langUrl(lang, '/compress-video'));
};
