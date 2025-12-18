
import { HandwritingVibe } from './types';

export const HANDWRITING_FONTS: Record<HandwritingVibe, string> = {
  elegant: 'handwriting-elegant',
  classic: 'handwriting-classic',
  bubbly: 'handwriting-bubbly',
  sketchy: 'handwriting-sketchy',
  raw: 'handwriting-raw',
  fancy: 'handwriting-fancy',
  bold: 'handwriting-bold',
  clean: 'handwriting-clean',
};

export const VIBE_DESCRIPTIONS: Record<HandwritingVibe, string> = {
  elegant: 'Artistic and flowing',
  classic: 'Timeless cursive script',
  bubbly: 'Sweet and rounded',
  sketchy: 'Expressive and informal',
  raw: 'Emotional and unrefined',
  fancy: 'Graceful and decorative',
  bold: 'Strong and playful',
  clean: 'Neat and approachable',
};

export const INITIAL_PROFILES = [
  { id: 'p1', name: 'Elegant Journal', vibe: 'elegant' as const, isDefault: true },
  { id: 'p2', name: 'Friendly Note', vibe: 'clean' as const, isDefault: false },
  { id: 'p3', name: 'Raw Thoughts', vibe: 'raw' as const, isDefault: false },
  { id: 'p4', name: 'Sweet Letter', vibe: 'bubbly' as const, isDefault: false },
  { id: 'p5', name: 'Sketchbook', vibe: 'sketchy' as const, isDefault: false },
  { id: 'p6', name: 'Fancy Greet', vibe: 'fancy' as const, isDefault: false },
  { id: 'p7', name: 'Bold Statement', vibe: 'bold' as const, isDefault: false },
  { id: 'p8', name: 'Classic Script', vibe: 'classic' as const, isDefault: false },
];
