
import { HandwritingVibe } from './types';

export const HANDWRITING_FONTS: Record<HandwritingVibe, string> = {
  neat: 'handwriting-neat',
  casual: 'handwriting-casual',
  messy: 'handwriting-messy',
  cute: 'handwriting-cute',
};

export const VIBE_DESCRIPTIONS: Record<HandwritingVibe, string> = {
  neat: 'Refined and elegant strokes',
  casual: 'Relaxed, everyday script',
  messy: 'Raw, energetic, and artistic',
  cute: 'Bubbly and playful characters',
};

export const INITIAL_PROFILES = [
  { id: 'p1', name: 'My Daily Journal', vibe: 'neat' as const, isDefault: true },
  { id: 'p2', name: 'Letters to Friends', vibe: 'casual' as const, isDefault: false },
];
