import { redirect, error } from '@sveltejs/kit';
import { getCanonicalLang } from '$lib/i18n/config';
import type { PageServerLoad } from './$types';
import { parseFrontmatter as matter } from '$lib/utils/markdown';

export const load: PageServerLoad = async ({ params }) => {
    const lang = getCanonicalLang(params.lang);
    const urlLang = lang.toLowerCase();
    
    // Glob all markdown files to find the correct one
    const modules = import.meta.glob('/src/lib/contents/labs/**/*.md', { query: '?raw', import: 'default' });
    
    const posts = [];
    
    for (const path in modules) {
        if (path.includes(`/labs/${urlLang}/`)) {
            const rawContent = await modules[path]() as string;
            const parsed = matter(rawContent);
            
            // Extract slug from filename
            const filename = path.split('/').pop() || '';
            const slug = filename.replace('.md', '');
            
            posts.push({
                slug,
                date: parsed.data.date || '1970-01-01'
            });
        }
    }
    
    if (posts.length === 0) {
        throw error(404, 'No labs found');
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const latestSlug = posts[0].slug;
    
    // Redirect to the latest post
    const prefix = params.lang ? `/${params.lang}` : '';
    throw redirect(302, `${prefix}/labs/${latestSlug}`);
};
