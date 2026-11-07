import { publicUrl } from '../lib/publicUrl';

// Single source of truth for every resume template used across the site.
// `layout` maps to a renderer inside components/ResumePreview.jsx
export const templates = [
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    tagline: 'Clean & recruiter-loved',
    person: 'Sarah Jenkins',
    role: 'Product Designer',
    accent: '#F4B41A',
    accentSoft: '#FEF6DA',
    photo: publicUrl('/images/sarah.jpg'),
    layout: 'accented',
    fontId: 'inter',
    swatch:
      'linear-gradient(135deg,#F4B41A 0%,#FFE9A8 55%,#1A1F3A 55%,#1A1F3A 100%)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Bold, senior & technical',
    person: 'Marcus Reed',
    role: 'Software Engineer',
    accent: '#1E2A4A',
    accentSoft: '#E3E8F4',
    photo: publicUrl('/images/avatar-4.jpg'),
    layout: 'sidebar',
    fontId: 'source-sans',
    swatch:
      'linear-gradient(135deg,#1E2A4A 0%,#2E3F6E 55%,#F4B41A 55%,#F4B41A 100%)',
  },
  {
    id: 'blush',
    name: 'Blush',
    tagline: 'Warm & creative',
    person: 'Elena Vargas',
    role: 'Marketing Lead',
    accent: '#EC4899',
    accentSoft: '#FCE7F3',
    photo: publicUrl('/images/avatar-2.jpg'),
    layout: 'centered',
    fontId: 'lora',
    swatch:
      'linear-gradient(135deg,#EC4899 0%,#FBCFE8 55%,#1A1F3A 55%,#1A1F3A 100%)',
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    tagline: 'Fresh & data-driven',
    person: 'Aiden Park',
    role: 'Data Analyst',
    accent: '#10B981',
    accentSoft: '#D1FAE5',
    photo: publicUrl('/images/avatar-3.jpg'),
    layout: 'twocol',
    fontId: 'inter',
    swatch:
      'linear-gradient(135deg,#10B981 0%,#A7F3D0 55%,#0E1224 55%,#0E1224 100%)',
  },
  {
    id: 'meridian',
    name: 'Meridian',
    tagline: 'Timeless & academic',
    person: 'Noah Bennett',
    role: 'Research Analyst',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
    photo: publicUrl('/images/avatar-1.jpg'),
    layout: 'classic',
    fontId: 'merriweather',
    swatch:
      'linear-gradient(135deg,#0F766E 0%,#99F6E4 55%,#111827 55%,#111827 100%)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Modern & product-led',
    person: 'Priya Raman',
    role: 'Product Manager',
    accent: '#7C3AED',
    accentSoft: '#EDE9FE',
    photo: publicUrl('/images/avatar-2.jpg'),
    layout: 'sidebar',
    fontId: 'montserrat',
    swatch:
      'linear-gradient(135deg,#7C3AED 0%,#DDD6FE 55%,#1F2937 55%,#1F2937 100%)',
  },
];

export const templateById = Object.fromEntries(
  templates.map((template) => [template.id, template]),
);

export function getTemplate(id) {
  return templateById[id] || templates[0];
}

export default templates;
