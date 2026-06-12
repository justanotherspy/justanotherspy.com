import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const notes = await getCollection('notes');

  const paths = [
    '/',
    '/projects/',
    '/notes/',
    '/dead-drop/',
    ...projects.map(p => `/projects/${p.id}/`),
    ...notes.map(n => `/notes/${n.id}/`),
  ];

  const urls = paths
    .map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
