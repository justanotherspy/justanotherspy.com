// Build-time Open Graph cards: one 1200x630 PNG per page, drawn with satori
// (layout to SVG) and resvg (SVG to PNG). Colours mirror the light tokens in
// src/styles/global.css; satori can't read CSS variables, so they are copied.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import serifUrl from './fonts/DMSerifDisplay-Regular.ttf?inline';
import serifItalicUrl from './fonts/DMSerifDisplay-Italic.ttf?inline';
import monoUrl from './fonts/IBMPlexMono-Regular.ttf?inline';

const BG = '#F5F2EE';
const TEXT = '#1A1814';
const ACCENT = '#A85C3A';
const MUTED = '#6B6560';
const BORDER = '#D8D4CF';

export interface Card {
  eyebrow: string;
  title: string;
  subtitle: string;
}

// Vite inlines each font as a base64 data URL at build time.
const bytes = (dataUrl: string) =>
  Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), c => c.charCodeAt(0)).buffer;

const fonts: Parameters<typeof satori>[1]['fonts'] = [
  { name: 'serif', data: bytes(serifUrl), weight: 400, style: 'normal' },
  { name: 'serif', data: bytes(serifItalicUrl), weight: 400, style: 'italic' },
  { name: 'mono', data: bytes(monoUrl), weight: 400, style: 'normal' },
];

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

export async function renderCard({ eyebrow, title, subtitle }: Card): Promise<Uint8Array<ArrayBuffer>> {
  const titleSize = title.length > 14 ? 104 : 132;

  const tree = el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: BG,
      borderTop: `10px solid ${ACCENT}`,
      padding: '56px 72px 52px',
      color: TEXT,
    },
    [
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [
        el('div', { fontFamily: 'serif', fontSize: 34 }, 'justanotherspy'),
        el('div', { fontFamily: 'mono', fontSize: 20, color: ACCENT, letterSpacing: 3 }, `/ ${eyebrow.toUpperCase()} /`),
      ]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { fontFamily: 'serif', fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1 }, title.toLowerCase()),
        el(
          'div',
          { fontFamily: 'serif', fontSize: 36, lineHeight: 1.3, color: MUTED, marginTop: 22, maxWidth: 980 },
          subtitle,
        ),
      ]),
      el(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${BORDER}`,
          paddingTop: 22,
        },
        [
          el('div', { fontFamily: 'mono', fontSize: 20, color: MUTED, letterSpacing: 2 }, 'JUSTANOTHERSPY.COM'),
          el('div', { fontFamily: 'serif', fontStyle: 'italic', fontSize: 30, color: MUTED }, 'j.a.s.'),
        ],
      ),
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
