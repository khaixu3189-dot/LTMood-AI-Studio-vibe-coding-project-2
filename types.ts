
export type HandwritingVibe = 'elegant' | 'classic' | 'bubbly' | 'sketchy' | 'raw' | 'fancy' | 'clean';

export interface HandwritingProfile {
  id: string;
  name: string;
  vibe: HandwritingVibe;
  isDefault: boolean;
}

export type TemplateType = 'Diary' | 'Letter' | 'Greeting Card';

export interface ArchiveEntry {
  id: string;
  transcription: string;
  profileId: string;
  template: TemplateType;
  moodPrompt: string;
  imageUrl: string;
  thumbnailUrl: string;
  timestamp: number;
}

export interface GenerationResult {
  imageUrl: string;
}

export interface ReferenceImage {
  id: string;
  data: string; // base64
  mimeType: string;
}
