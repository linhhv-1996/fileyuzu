import { getCanonicalLang } from '$lib/i18n/config';

export async function handle({ event, resolve }) {
	const lang = getCanonicalLang(event.params.lang);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});

	return response;
}
