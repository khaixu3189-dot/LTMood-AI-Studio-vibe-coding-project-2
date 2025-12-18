
import { HandwritingVibe } from './types';

export const HANDWRITING_FONTS: Record<HandwritingVibe, string> = {
  elegant: 'handwriting-elegant',
  vintage: 'handwriting-vintage',
  bubbly: 'handwriting-bubbly',
  messy: 'handwriting-messy',
  clean: 'handwriting-clean',
};

export const VIBE_DESCRIPTIONS: Record<HandwritingVibe, string> = {
  elegant: 'Sophisticated cursive with artistic flourishes',
  vintage: 'Old-world calligraphy with varying ink pressure',
  bubbly: 'Sweet, rounded letters with a cheerful youthful feel',
  messy: 'Raw, emotional scrawl with uneven alignment',
  clean: 'Minimalist, clear print that is soft and legible',
};

export const INITIAL_PROFILES = [
  { id: 'p1', name: 'Artisan Flow', vibe: 'elegant' as const, isDefault: true },
  { id: 'p2', name: 'Old Soul', vibe: 'vintage' as const, isDefault: false },
  { id: 'p3', name: 'Childhood Dreams', vibe: 'bubbly' as const, isDefault: false },
  { id: 'p4', name: 'Deep Reflections', vibe: 'messy' as const, isDefault: false },
  { id: 'p5', name: 'Quiet Clarity', vibe: 'clean' as const, isDefault: false },
];
