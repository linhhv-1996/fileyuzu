import { SUPPORTED_LANGUAGES, langUrl } from '$lib/i18n/config';
import { tools } from '$lib/config/tools';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const origin = url.origin;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const getFinalUrl = (path: string) => {
        // No trailing slash except for English root '/'
        if (path === '/') return `${origin}/`;
        const finalPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
        return `${origin}${finalPath}`;
    };

    const addLocalizedUrls = (basePath: string) => {
        let node = '';
        for (const lang of SUPPORTED_LANGUAGES) {
            const locPath = langUrl(lang.code, basePath);
            const locUrl = getFinalUrl(locPath);
            node += `  <url>\n`;
            node += `    <loc>${locUrl}</loc>\n`;
            node += `  </url>\n`;
        }
        return node;
    };

    // 1. Home
    xml += addLocalizedUrls('/');
    
    // Tools pages
    for (const tool of tools) {
        xml += addLocalizedUrls(`/${tool.slug}`);
    }

    // 2. Blog pages
    const modules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    
    for (const path of Object.keys(modules)) {
        const match = path.match(/\/blog\/([^/]+)\/([^/]+)\.md$/);
        if (match) {
            const [, postLang, slug] = match;
            const blogPath = langUrl(postLang, `/blog/${slug}`);
            const blogUrl = getFinalUrl(blogPath);
            
            xml += `  <url>\n`;
            xml += `    <loc>${blogUrl}</loc>\n`;
            xml += `  </url>\n`;
        }
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
};
