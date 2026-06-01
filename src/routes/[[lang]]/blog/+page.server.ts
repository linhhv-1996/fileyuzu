import type { PageServerLoad } from './$types';
import matter from 'gray-matter';

export const load: PageServerLoad = async ({ params }) => {
    const lang = params.lang || 'en';
    
    // We must use import.meta.glob statically without dynamic variables inside the glob string.
    // glob all markdown files and filter by lang.
    const modules = import.meta.glob('/src/lib/contents/blog/**/*.md', { query: '?raw', import: 'default' });
    
    const posts = [];
    
    for (const path in modules) {
        if (path.includes(`/blog/${lang}/`)) {
            const rawContent = await modules[path]() as string;
            const parsed = matter(rawContent);
            
            // Extract slug from filename
            const filename = path.split('/').pop() || '';
            const slug = filename.replace('.md', '');
            
            posts.push({
                slug,
                title: parsed.data.title || 'Untitled',
                description: parsed.data.description || '',
                date: parsed.data.date || ''
            });
        }
    }
    
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
        posts
    };
};
