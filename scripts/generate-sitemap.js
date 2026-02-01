import fs from 'fs';
import path from 'path';

// Basic sitemap generator. Can be extended to fetch dynamic routes.
const BASE = process.env.SITEMAP_BASE_URL || 'https://www.cashouttips.ca';
const outPath = path.join(process.cwd(), 'sitemap.xml');

const staticPaths = [
    '/',
    '/submit',
    '/my-submissions',
    '/privacy',
    '/terms',
    '/auth',
];

function buildUrl(pathname) {
    return `  <url>\n    <loc>${BASE}${pathname}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>`;
}

const urls = staticPaths.map((p) => buildUrl(p)).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

fs.writeFileSync(outPath, xml, 'utf8');
console.log('Wrote sitemap to', outPath);
