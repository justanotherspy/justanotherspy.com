import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderCard, type Card } from '../../og/card';

// One card per page that sets `ogImage` in BaseLayout: the fixed pages here,
// plus one per project entry (named after its id).
export const getStaticPaths: GetStaticPaths = async () => {
  const fixed: Array<{ card: string } & Card> = [
    {
      card: 'home',
      eyebrow: 'a personal site',
      title: 'small tools, built to be read.',
      subtitle: 'Command line tools by a security engineer, most of them for Claude Code.',
    },
    {
      card: 'projects',
      eyebrow: 'projects',
      title: 'projects',
      subtitle: 'Things I’ve made, in various states of finished.',
    },
    {
      card: 'dead-drop',
      eyebrow: 'anonymous · write-only',
      title: 'dead drop',
      subtitle: 'Leave a message. It goes straight to a private channel.',
    },
  ];
  const projects = (await getCollection('projects')).map(p => ({
    card: `project-${p.id}`,
    eyebrow: p.data.tag,
    title: p.data.title,
    subtitle: p.data.description,
  }));

  return [...fixed, ...projects].map(({ card, ...props }) => ({ params: { card }, props }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as Card);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
