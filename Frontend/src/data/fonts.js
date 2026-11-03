// Font catalogue for the resume builder. `stack` is applied inline to the
// preview page so the change is instant (no re-render of the whole editor).
export const fonts = [
  {
    id: 'inter',
    name: 'Inter',
    category: 'Sans serif',
    stack: "'Inter', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: 'source-sans',
    name: 'Source Sans 3',
    category: 'Sans serif',
    stack: "'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Geometric sans',
    stack: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: 'nunito',
    name: 'Nunito Sans',
    category: 'Friendly sans',
    stack: "'Nunito Sans', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'Serif',
    stack: "'Merriweather', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'Serif',
    stack: "'Lora', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Display serif',
    stack: "'Playfair Display', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    category: 'Classic serif',
    stack: "'Libre Baskerville', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'roboto-slab',
    name: 'Roboto Slab',
    category: 'Slab',
    stack: "'Roboto Slab', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    category: 'Monospace',
    stack: "'Space Mono', ui-monospace, SFMono-Regular, monospace",
  },
];

export const fontById = Object.fromEntries(fonts.map((font) => [font.id, font]));

export function getFont(id) {
  return fontById[id] || fonts[0];
}

export const fontCategories = [...new Set(fonts.map((font) => font.category))];

export default fonts;
