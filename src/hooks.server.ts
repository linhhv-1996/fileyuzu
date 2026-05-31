export function handle({ event, resolve }) {
	const lang = event.params.lang || 'en';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
}
