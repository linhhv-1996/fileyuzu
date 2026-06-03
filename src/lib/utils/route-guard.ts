import { error } from '@sveltejs/kit';

/**
 * Enforces that the current language is within the allowed markets.
 * Throws a 404 error if not.
 */
export function enforceMarket(currentLang: string, allowedMarkets: string[]) {
    if (!allowedMarkets.includes(currentLang)) {
        error(404, 'Not found');
    }
}
