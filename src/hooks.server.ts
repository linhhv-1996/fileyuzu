import { redirect } from '@sveltejs/kit';
import { getCanonicalLang } from '$lib/i18n/config';

// --- Tier-1 geo redirect: send US/UK/CA/AU/NZ traffic on these two tools ---
// over to squishyfile.com instead of serving them on fileyuzu.
//
// route.id (not url.pathname) is used for matching so it works regardless of
// the optional /[[lang]]/ prefix (e.g. /compress-video, /ja/compress-video...).
const TIER1_COUNTRIES = new Set(['US', 'GB', 'CA', 'AU', 'NZ']);

const GEO_REDIRECT_MAP: Record<string, string> = {
	'/[[lang]]/compress-video': 'https://squishyfile.com/',
	'/[[lang]]/video-to-mp3': 'https://squishyfile.com/video-to-mp3'
};

// Crude bot allowlist so search engine crawlers (which mostly hit from US
// datacenters) keep seeing the fileyuzu page instead of being redirected -
// otherwise Google would see a 302 on these URLs and could drop them from
// the index, even though real US visitors should get sent to squishyfile.
const BOT_UA_PATTERN =
	/bot|crawl|spider|slurp|mediapartners|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|ahrefsbot|semrushbot|mj12bot|petalbot/i;

function isTier1GeoRedirect(event: Parameters<import('@sveltejs/kit').Handle>[0]['event']) {
	const routeId = event.route.id;
	if (!routeId) return null;

	const target = GEO_REDIRECT_MAP[routeId];
	if (!target) return null;

	const country = event.platform?.cf?.country;
	if (!country || !TIER1_COUNTRIES.has(country)) return null;

	const userAgent = event.request.headers.get('user-agent') ?? '';
	if (BOT_UA_PATTERN.test(userAgent)) return null;

	return target;
}

export async function handle({ event, resolve }) {
	const geoTarget = isTier1GeoRedirect(event);
	if (geoTarget) {
		const destination = new URL(geoTarget);
		// carry over query string (utm params, etc.)
		event.url.searchParams.forEach((value, key) => destination.searchParams.set(key, value));
		throw redirect(302, destination.toString());
	}

	const lang = getCanonicalLang(event.params.lang);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});

	return response;
}
