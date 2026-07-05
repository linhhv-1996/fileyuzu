import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCanonicalLang, langUrl } from '$lib/i18n/config';

// handwriting-ocr has been merged into image-to-text (same OCRReader tool,
// duplicate LP was cannibalizing the main page's rankings).
export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    throw redirect(301, langUrl(lang, '/image-to-text'));
};
