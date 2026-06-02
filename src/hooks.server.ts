import { getCanonicalLang } from '$lib/i18n/config';

export async function handle({ event, resolve }) {
	const lang = getCanonicalLang(event.params.lang);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});

	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

	return response;
}
