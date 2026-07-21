import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
    const file = params.file;
    if (!file) throw error(404, 'Not found');
    
    // Fetch the actual static file
    const res = await fetch(`/ebook-convert/${file}`);
    
    if (!res.ok) {
        throw error(res.status, 'File not found');
    }
    
    const headers = new Headers(res.headers);
    // Overwrite or append required isolation headers
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    
    // Set heavy caching since these are WASM and zip files that don't change frequently
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Ensure correct mime types for wasm and js if they are missing
    if (file.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
    if (file.endsWith('.js') || file.endsWith('.mjs')) headers.set('Content-Type', 'text/javascript');
    if (file.endsWith('.zip')) headers.set('Content-Type', 'application/zip');

    return new Response(res.body, {
        status: res.status,
        headers
    });
};
