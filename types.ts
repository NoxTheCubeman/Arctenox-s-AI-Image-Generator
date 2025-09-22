export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type SeedControl = 'fixed' | 'increment' | 'decrement' | 'randomize';
export type AppTab = 'generate' | 'merge';

// FIX: Added 'novelai-style' to the type union to resolve type errors.
export type ArtisticStyle =
  | "3d-model" | "abstract-tech" | "anime" | "anime-dark-fantasy" | "anime-fantasy" | "anypastel" | "anything-style" | "arc-fantasy" | "arc-rococo" | "arctenox-style" | "art-deco" | "art-nouveau" | "baroque" | "certified-rat-style" | "chibi" | "cinematic" | "claymation" | "comic-book" | "concept-art" | "cyber-gothic" | "cyberpunk" | "danbooru-style" | "double-exposure" | "e621-style" | "ecaj-style" | "fantasy" | "film-noir" | "film-grain" | "flatline-illus" | "ghibli-esque" | "glassmorphism" | "gothic" | "gouache" | "gritty" | "hologram-glitch" | "hyper-realism" | "hyphoria-illu" | "illustration" | "impressionism" | "ink-painting" | "vibrant-anime" | "isometric" | "kegant-style" | "line-art" | "lo-fi" | "low-poly" | "shinkai-makoto" | "mecha" | "minimalist" | "modern-anime" | "novelai-style" | "papercraft" | "photorealistic" | "pixel-art" | "pixai-aesthetic" | "pony-diffusion-xl" | "pop-art" | "psychedelic" | "redactedpaws-style" | "retro-anime-90s" | "rpaws-anthro" | "semi-realistic-2-5d" | "sketch" | "splatter-art" | "steampunk" | "sticker-style" | "tribal-art" | "ukiyo-e" | "valentine-designs" | "vaporwave" | "watercolor"
  // New Styles
  | "novelai-anime-v3" | "novelai-furry-diffusion" | "civitai-epic-realism" | "civitai-concept-masterpiece" | "civitai-semi-realistic" | "seaart-exquisite-detail" | "seaart-ancient-style" | "seaart-mecha-warrior" | "pixai-moonbeam" | "pixai-realism"
  // Styles from user images
  | "high-contrast-manga" | "volcanic-soul" | "gothic-anime" | "polished-furry" | "webtoon-style" | "ethereal-anime-painting" | "rendered-digital-art" | "cel-shaded-illustration" | "crystalline-frost" | "tactical-anime"
  // Styles from new images
  | "vibrant-abstract-painting" | "glossy-airbrushed-anime"
  // New anime styles
  | "bocchi-the-rock" | "chainsaw-man" | "dandadan-manga" | "frieren-anime" | "gachiakuta-manga" | "jujutsu-kaisen" | "oshi-no-ko" | "solo-leveling" | "blue-lock"
  | "high-resolution-pixel-art"
  // More unique styles
  | "stained-glass-window" | "tarot-card" | "riso-print" | "art-deco-futurism" | "golden-hour-photography" | "trigger-studio-style" | "ufotable-style" | "kyoto-animation-style"
  // New styles from user
  | "colored-line-art" | "painterly" | "colored-pencil" | "colored-sketch";

export type ImageModel = "gemini-2.5-flash-image-preview" | "imagen-4.0-generate-001" | "comfyui-local";

export interface LoRA {
  id: string;
  name: string;
  strength: number;
}

export interface ImageConfig {
  numberOfImages: number;
  batchSize: number; // For ComfyUI
  aspectRatio: AspectRatio;
  styles: string[];
  negativePrompt: string;
  promptPrefix: string;
  promptSuffix: string;
  model: ImageModel;
  detailLevel: number;
  styleIntensity: number;
  // ComfyUI specific
  selectedComfyUiWorkflowId?: string;
  selectedComfyUiCheckpoint?: string;
  width?: number;
  height?: number;
  cfg: number;
  comfyUiSeed: number;
  comfyUiSeedControl: SeedControl;
  loras: LoRA[];
  comfyUiSteps: number;
  comfyUiSamplerName: string;
  comfyUiScheduler: string;
}

export interface GenerationHistoryEntry {
  id: string;
  imageDataUrl: string;
  prompt: string;
  config: ImageConfig;
  timestamp: number;
  uploadedImage: { data: string, mimeType: string } | null;
  // ComfyUI sync specific
  comfyUiWorkflow?: string;
  comfyUiFilename?: string;
}


export interface SavedStylePreset {
  id: string;
  name: string;
  styles: string[];
}

export interface CustomStylePreset {
  id: string;
  name: string;
  prompt: string;
}

export interface SafetyCheckResult {
    isSafe: boolean;
    feedback: string;
    suggestion: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: { [key: string]: string };
  backgroundImage?: string;
  uiOpacity?: number;
}

export interface StatusMessage {
  text: string;
  type: 'error' | 'info' | 'success' | 'warning';
}

export interface ComfyUIWorkflowPreset {
    id: string;
    name: string;
    workflowJson: string;
}

export type TagCategories = Record<string, string[]>;

export interface GenerationRecipe {
  id: string;
  name: string;
  prompt: string;
  config: ImageConfig;
}