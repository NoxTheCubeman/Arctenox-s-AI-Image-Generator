





import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ImageConfig, AspectRatio, ArtisticStyle, ImageModel, SavedStylePreset, CustomStylePreset, SafetyCheckResult, ComfyUIWorkflowPreset, TagCategories, SeedControl, LoRA } from '../types';
import { randomPrompts } from '../lib/prompts';
import { generateRandomizedPrompt } from '../lib/tagPromptBuilder';
import { analyzeWorkflow, WorkflowAnalysis } from '../services/comfyuiService';
import ResizableComfyUIEmbed from './ResizableComfyUIEmbed';

interface ImagePromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  config: ImageConfig;
  setConfig: React.Dispatch<React.SetStateAction<ImageConfig>>;
  onSubmit: () => void;
  isLoading: boolean;
  onOpenStyleManager: () => void;
  onOpenRecipeManager: () => void;
  savedPresets: SavedStylePreset[];
  customStyles: CustomStylePreset[];
  onApplyPreset: (styles: string[]) => void;
  uploadedImage: { data: string; mimeType: string } | null;
  setUploadedImage: (image: { data: string; mimeType: string } | null) => void;
  onEnhancePrompt: () => void;
  isEnhancing: boolean;
  onSuggestNegativePrompt: () => void;
  isSuggestingNegative: boolean;
  onCheckSafety: () => void;
  isCheckingSafety: boolean;
  safetyCheckResult: SafetyCheckResult | null;
  setSafetyCheckResult: (result: SafetyCheckResult | null) => void;
  // ComfyUI Props
  comfyUiServerAddress: string;
  setComfyUiServerAddress: (value: string) => void;
  onOpenComfyGuide: () => void;
  onOpenComfyUIEmbed: () => void;
  onSyncComfyImages: (options?: { closeModal?: boolean }) => Promise<void>;
  onQueueComfyInBackground: () => Promise<void>;
  comfyUiStatus: 'idle' | 'checking' | 'online' | 'offline';
  onCheckComfyConnection: () => void;
  comfyUiWorkflows: ComfyUIWorkflowPreset[];
  selectedComfyUiWorkflowId: string;
  setSelectedComfyUiWorkflowId: (id: string) => void;
  onOpenWorkflowManager: () => void;
  comfyUiCheckpoints: string[];
  comfyUiLoras: string[];
  selectedComfyUiCheckpoint: string;
  setSelectedComfyUiCheckpoint: (value: string) => void;
  // New props for Tag Manager & Guides
  managedTags: TagCategories;
  onOpenTagManager: () => void;
  onOpenNegativeGuide: () => void;
  onOpenCheckpointManager: () => void;
  hiddenCheckpoints: string[];
}

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const artisticStyles: { value: ArtisticStyle; label: string }[] = [
  { value: "3d-model", label: "3D Model" },
  { value: "abstract-tech", label: "Abstract Tech" },
  { value: "anime", label: "Anime (Detailed)" },
  { value: "anime-dark-fantasy", label: "Anime Dark Fantasy" },
  { value: "anime-fantasy", label: "Anime Fantasy" },
  { value: "anypastel", label: "AnyPastel" },
  { value: "anything-style", label: "Anything Style" },
  { value: "arc-fantasy", label: "Arc-Fantasy" },
  { value: "arc-rococo", label: "Arc-Rococo" },
  { value: "arctenox-style", label: "Arctenox's Style" },
  { value: "art-deco", label: "Art Deco" },
  { value: "art-nouveau", label: "Art Nouveau" },
  { value: "baroque", label: "Baroque" },
  { value: "blue-lock", label: "Blue Lock Anime" },
  { value: "bocchi-the-rock", label: "Bocchi the Rock! Anime" },
  { value: "cel-shaded-illustration", label: "Cel-Shaded Illustration" },
  { value: "certified-rat-style", label: "Certified Rat's Style" },
  { value: "chainsaw-man", label: "Chainsaw Man Anime" },
  { value: "chibi", label: "Chibi Style" },
  { value: "cinematic", label: "Cinematic" },
  { value: "civitai-concept-masterpiece", label: "Civitai Concept Masterpiece" },
  { value: "civitai-epic-realism", label: "Civitai Epic Realism" },
  { value: "civitai-semi-realistic", label: "Civitai Semi-Realistic" },
  { value: "claymation", label: "Claymation" },
  { value: "comic-book", label: "Comic Book" },
  { value: "concept-art", label: "Concept Art" },
  { value: "cyber-gothic", label: "Cyber Gothic" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "dandadan-manga", label: "Dandadan Manga" },
  { value: "danbooru-style", label: "Danbooru Tag Style" },
  { value: "double-exposure", label: "Double Exposure" },
  { value: "e621-style", label: "e621 Tag Style" },
  { value: "ecaj-style", label: "Ecaj's Style" },
  { value: "ethereal-anime-painting", label: "Ethereal Anime Painting" },
  { value: "fantasy", label: "Fantasy Art" },
  { value: "film-noir", label: "Film Noir" },
  { value: "film-grain", label: "Film Grain" },
  { value: "flatline-illus", label: "Flatline-Illus (Niji)" },
  { value: "frieren-anime", label: "Frieren Anime" },
  { value: "gachiakuta-manga", label: "Gachiakuta Manga" },
  { value: "ghibli-esque", label: "Ghibli-esque" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "glossy-airbrushed-anime", label: "Glossy Airbrushed Anime" },
  { value: "gothic-anime", label: "Gothic Anime" },
  { value: "gothic", label: "Gothic Horror" },
  { value: "gouache", label: "Gouache Painting" },
  { value: "gritty", label: "Gritty" },
  { value: "high-contrast-manga", label: "High-Contrast Manga" },
  { value: "hologram-glitch", label: "Hologram / Glitch" },
  { value: "hyper-realism", label: "Hyper Realism" },
  { value: "hyphoria-illu", label: "Hyphoria Illu Style" },
  { value: "illustration", label: "Illustration" },
  { value: "impressionism", label: "Impressionism" },
  { value: "ink-painting", label: "Ink Painting" },
  { value: "vibrant-anime", label: "Ionsyx" },
  { value: "isometric", label: "Isometric" },
  { value: "jujutsu-kaisen", label: "Jujutsu Kaisen Anime" },
  { value: "kegant-style", label: "Kegant Style" },
  { value: "line-art", label: "Line Art" },
  { value: "lo-fi", label: "Lo-fi Aesthetic" },
  { value: "low-poly", label: "Low Poly" },
  { value: "shinkai-makoto", label: "Makoto Shinkai Style" },
  { value: "mecha", label: "Mecha" },
  { value: "minimalist", label: "Minimalist" },
  { value: "modern-anime", label: "Modern Anime" },
  { value: "novelai-style", label: "NovelAI Aesthetic" },
  { value: "novelai-anime-v3", label: "NovelAI Anime V3" },
  { value: "novelai-furry-diffusion", label: "NovelAI Furry Diffusion" },
  { value: "oshi-no-ko", label: "Oshi no Ko Anime" },
  { value: "papercraft", label: "Papercraft / Cutout" },
  { value: "photorealistic", label: "Photorealistic" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "pixai-aesthetic", label: "PixAI Aesthetic" },
  { value: "pixai-moonbeam", label: "PixAI Moonbeam" },
  { value: "pixai-realism", label: "PixAI Realism" },
  { value: "polished-furry", label: "Polished Furry / Anthro" },
  { value: "pony-diffusion-xl", label: "Pony Diffusion XL Style" },
  { value: "pop-art", label: "Pop Art" },
  { value: "psychedelic", label: "Psychedelic Art" },
  { value: "redactedpaws-style", label: "RedactedPaws' Style" },
  { value: "rendered-digital-art", label: "Rendered Digital Art" },
  { value: "retro-anime-90s", label: "Retro Anime (90s)" },
  { value: "rpaws-anthro", label: "Anthro / Furry" },
  { value: "seaart-ancient-style", label: "SeaArt Ancient Style" },
  { value: "seaart-exquisite-detail", label: "SeaArt Exquisite Detail" },
  { value: "seaart-mecha-warrior", label: "SeaArt Mecha Warrior" },
  { value: "semi-realistic-2-5d", label: "Semi-Realistic (2.5D)" },
  { value: "sketch", label: "Sketch" },
  { value: "solo-leveling", label: "Solo Leveling Anime/Manhwa" },
  { value: "splatter-art", label: "Splatter Art" },
  { value: "steampunk", label: "Steampunk" },
  { value: "sticker-style", label: "Sticker Style" },
  { value: "tribal-art", label: "Tribal Art" },
  { value: "ukiyo-e", label: "Ukiyo-e" },
  { value: "valentine-designs", label: "Valentinedesigns' Style" },
  { value: "vaporwave", label: "Vaporwave" },
  { value: "vibrant-abstract-painting", label: "Vibrant Abstract Painting" },
  { value: "volcanic-soul", label: "Volcanic Soul" },
  { value: "watercolor", label: "Watercolor" },
  { value: "webtoon-style", label: "Webtoon Style" },
];

const imageModels: { value: ImageModel; label: string }[] = [
    { value: "gemini-2.5-flash-image-preview", label: "Gemini 2.5 Flash Image Preview" },
    { value: "imagen-4.0-generate-001", label: "Imagen 4.0" },
    { value: "comfyui-local", label: "ComfyUI (Local)" },
];

// FIX: Define a discriminated union for model capabilities to help TypeScript narrow types.
type NoBatchCapability = { maxImages: number; aspectRatio: boolean; img2img: boolean; batch: false; };
type BatchCapability = { maxImages: number; aspectRatio: boolean; img2img: boolean; batch: true; maxBatch: number; };
type Capability = NoBatchCapability | BatchCapability;

const modelCapabilities: Record<ImageModel, Capability> = {
    'imagen-4.0-generate-001': { maxImages: 8, aspectRatio: true, img2img: true, batch: false },
    'gemini-2.5-flash-image-preview': { maxImages: 8, aspectRatio: true, img2img: true, batch: false },
    'comfyui-local': { maxImages: 1, aspectRatio: false, img2img: true, batch: true, maxBatch: 10 },
};

const detailLevelLabels: Record<string, string> = {
  '-5': 'Very Abstract',
  '-4': 'Abstract',
  '-3': 'Minimalist',
  '-2': 'Low Detail',
  '-1': 'Slightly Simple',
  '0': 'None (Default)',
  '1': 'Slightly Detailed',
  '2': 'Detailed',
  '3': 'Highly Detailed',
  '4': 'Ornate',
  '5': 'Hyperdetailed',
};

const intensityLevelLabels: Record<string, string> = {
  '-10': 'Extreme Opposite (-10)',
  '-9': 'Extreme Opposite (-9)',
  '-8': 'Very Inverted (-8)',
  '-7': 'Very Inverted (-7)',
  '-6': 'Inverted Style (-6)',
  '-5': 'Inverted Style (-5)',
  '-4': 'Subtle Opposite (-4)',
  '-3': 'Subtle Opposite (-3)',
  '-2': 'Less Intense (-2)',
  '-1': 'Less Intense (-1)',
  '0': 'Default (0)',
  '1': 'Enhanced (+1)',
  '2': 'Enhanced (+2)',
  '3': 'Vibrant (+3)',
  '4': 'Vibrant (+4)',
  '5': 'Intense (+5)',
  '6': 'Intense (+6)',
  '7': 'Very Intense (+7)',
  '8': 'Very Intense (+8)',
  '9': 'Dramatic (+9)',
  '10': 'Dramatic (+10)',
};

const FormSection: React.FC<{title: string; children: React.ReactNode; actions?: React.ReactNode;}> = ({ title, children, actions }) => (
    <fieldset className="space-y-4 rounded-lg bg-bg-primary/50 border border-border-primary/50 p-4 relative group/section">
        <div className="flex justify-between items-center border-b border-border-primary/50 pb-2 mb-4">
            <h3 className="text-lg font.semibold text-text-secondary">{title}</h3>
            {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
        <div className="space-y-4">{children}</div>
    </fieldset>
);

const SafetyCheckResultDisplay: React.FC<{
    result: SafetyCheckResult;
    onApplySuggestion: (suggestion: string) => void;
    onDismiss: () => void;
}> = ({ result, onApplySuggestion, onDismiss }) => {
    const isSafe = result.isSafe;
    const boxClass = isSafe
        ? "bg-success-bg border-success text-success"
        : "bg-warning-bg border-warning text-warning";
    const icon = isSafe ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className={`p-3 rounded-md flex items-start text-sm animate-fade-in ${boxClass}`} role="alert">
            {icon}
            <div className="flex-grow">
                <p className="font-semibold">{result.feedback}</p>
                {!isSafe && result.suggestion && (
                    <div className="mt-2 pt-2 border-t border-warning/50">
                        <p className="text-xs italic">Suggestion: "{result.suggestion}"</p>
                        <button 
                            onClick={() => onApplySuggestion(result.suggestion)}
                            className="mt-1 text-xs font-bold text-text-primary bg-warning/50 hover:bg-warning/80 px-2 py-1 rounded-md transition-colors"
                        >
                            Use Suggestion
                        </button>
                    </div>
                )}
            </div>
            <button onClick={onDismiss} className="ml-2 p-1 rounded-full hover:bg-white/10" aria-label="Dismiss">
                &#x2715;
            </button>
        </div>
    );
};


const ImagePromptForm: React.FC<ImagePromptFormProps> = ({ 
    prompt, setPrompt, config, setConfig, onSubmit, isLoading, onOpenStyleManager, onOpenRecipeManager,
    savedPresets, customStyles, onApplyPreset, uploadedImage, setUploadedImage,
    onEnhancePrompt, isEnhancing, onSuggestNegativePrompt, isSuggestingNegative, onCheckSafety, isCheckingSafety, safetyCheckResult, setSafetyCheckResult,
    comfyUiServerAddress, setComfyUiServerAddress, onOpenComfyGuide, onOpenComfyUIEmbed, onSyncComfyImages, onQueueComfyInBackground,
    comfyUiStatus, onCheckComfyConnection, comfyUiWorkflows, selectedComfyUiWorkflowId,
    setSelectedComfyUiWorkflowId, onOpenWorkflowManager, comfyUiCheckpoints, 
    comfyUiLoras, selectedComfyUiCheckpoint, setSelectedComfyUiCheckpoint,
    managedTags, onOpenTagManager, onOpenNegativeGuide, onOpenCheckpointManager, hiddenCheckpoints
}) => {
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [styleSearchTerm, setStyleSearchTerm] = useState("");
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const [workflowAnalysis, setWorkflowAnalysis] = useState<WorkflowAnalysis>({ hasRgthreeLoader: false, loraLoaderNodeIds: [] });
  
  const isComfyUi = config.model === 'comfyui-local';
  const capabilities = modelCapabilities[config.model];
  
  const visibleCheckpoints = useMemo(() => 
    comfyUiCheckpoints.filter(c => !hiddenCheckpoints.includes(c)),
    [comfyUiCheckpoints, hiddenCheckpoints]
  );
  
  const allStyles = useMemo(() => 
    [...artisticStyles, ...customStyles.map(cs => ({ value: cs.id, label: cs.name }))]
    .sort((a,b) => a.label.localeCompare(b.label)), 
    [customStyles]
  );
  
  const filteredStyles = useMemo(() => 
    allStyles.filter(style => 
        style.label.toLowerCase().includes(styleSearchTerm.toLowerCase())
    ),
    [allStyles, styleSearchTerm]
  );

  useEffect(() => {
    const workflowPreset = comfyUiWorkflows.find(w => w.id === selectedComfyUiWorkflowId);
    if (workflowPreset?.workflowJson) {
        const analysis = analyzeWorkflow(workflowPreset.workflowJson);
        setWorkflowAnalysis(analysis);

        setConfig(prevConfig => {
            if (analysis.loraLoaderNodeIds.length > 0 && !analysis.hasRgthreeLoader) {
                const newLoras: LoRA[] = [];
                for (let i = 0; i < analysis.loraLoaderNodeIds.length; i++) {
                    newLoras.push(prevConfig.loras[i] || { id: crypto.randomUUID(), name: '', strength: 1.0 });
                }
                if (JSON.stringify(newLoras) !== JSON.stringify(prevConfig.loras.slice(0, newLoras.length))) {
                     return { ...prevConfig, loras: newLoras };
                }
            } else if (analysis.loraLoaderNodeIds.length === 0 && !analysis.hasRgthreeLoader) {
                if (prevConfig.loras.length > 0) {
                    return { ...prevConfig, loras: [] };
                }
            }
            return prevConfig;
        });
    } else {
        setWorkflowAnalysis({ hasRgthreeLoader: false, loraLoaderNodeIds: [] });
    }
  }, [selectedComfyUiWorkflowId, comfyUiWorkflows, setConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStyleChange = (styleValue: string) => {
    const newStyles = config.styles.includes(styleValue)
      ? config.styles.filter(s => s !== styleValue)
      : [...config.styles, styleValue];
    setConfig(prev => ({ ...prev, styles: newStyles }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomPrompt = () => {
    const newPrompt = generateRandomizedPrompt(managedTags);
    setPrompt(newPrompt);
    setSafetyCheckResult(null);
  };
  
  const handleClearImage = () => {
    setUploadedImage(null);
    if (capabilities.img2img === false) {
      setConfig(prev => ({...prev, model: 'imagen-4.0-generate-001'}));
    }
  };

  const handleAddLoRA = () => {
    setConfig(prev => {
      return {
        ...prev,
        loras: [...prev.loras, { id: crypto.randomUUID(), name: comfyUiLoras[0] || '', strength: 1.0 }]
      };
    });
  };

  const handleRemoveLoRA = (id: string) => {
    setConfig(prev => ({
      ...prev,
      loras: prev.loras.filter(lora => lora.id !== id)
    }));
  };

  const handleUpdateLoRA = (id: string, field: 'name' | 'strength', value: string | number) => {
    setConfig(prev => ({
      ...prev,
      loras: prev.loras.map(lora => lora.id === id ? { ...lora, [field]: value } : lora)
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newModel = e.target.value as ImageModel;
      setConfig(prev => {
          const newConfig = { ...prev, model: newModel };
          if (newModel === 'comfyui-local') {
              // Set the default workflow when switching to ComfyUI
              newConfig.selectedComfyUiWorkflowId = 'default-t2i-simple';
          }
          return newConfig;
      });
  };
  
  const isComfyReady = comfyUiStatus === 'online' && !!selectedComfyUiCheckpoint;
  const isSubmitDisabled = isLoading || (isComfyUi && !isComfyReady);
  
  const handleSubmitOrQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComfyUi) {
        if (isComfyReady) {
            onQueueComfyInBackground();
        }
    } else {
        onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmitOrQueue} className="space-y-6 animate-slide-up">
        {/* Core Prompt Section */}
        <FormSection title="Core Prompt" actions={
            <button type="button" onClick={onOpenRecipeManager} className="text-sm font-medium text-accent hover:text-text-primary transition-colors">Manage Recipes</button>
        }>
             <div className="relative">
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        if (safetyCheckResult) setSafetyCheckResult(null);
                    }}
                    placeholder="e.g., A majestic bioluminescent jellyfish floating through a starry nebula..."
                    className="w-full h-28 p-3 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent resize-none pr-32"
                    required
                    disabled={isLoading}
                />
                 <div className="absolute top-3 right-3 flex flex-col space-y-2">
                     <button type="button" onClick={handleRandomPrompt} disabled={isLoading} className="text-xs p-1.5 rounded-md bg-bg-tertiary/80 hover:bg-accent/80 hover:text-white transition-colors" title="Generate Random Prompt">
                        🎲
                     </button>
                      <button type="button" onClick={onEnhancePrompt} disabled={isLoading || isEnhancing || !prompt.trim()} className="text-xs p-1.5 rounded-md bg-bg-tertiary/80 hover:bg-accent/80 hover:text-white transition-colors flex items-center justify-center" title="Enhance Prompt with AI">
                        {isEnhancing ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : '✨'}
                     </button>
                      <button type="button" onClick={onCheckSafety} disabled={isLoading || isCheckingSafety || !prompt.trim()} className="text-xs p-1.5 rounded-md bg-bg-tertiary/80 hover:bg-accent/80 hover:text-white transition-colors flex items-center justify-center" title="Check Prompt Safety">
                        {isCheckingSafety ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : '🛡️'}
                     </button>
                </div>
            </div>
            <p className="text-xs text-warning text-center font-semibold -mt-2">
                IMPORTANT: If you want to generate anything explicit use ComfyUI (Local).
            </p>
            <div className='flex justify-end -mt-2'>
                <button type='button' onClick={onOpenTagManager} className="text-xs font-medium text-accent hover:text-text-primary transition-colors">Manage Tags</button>
            </div>
            {config.model !== 'imagen-4.0-generate-001' && (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                             <label htmlFor="negativePrompt" className="block text-sm font-medium text-text-secondary">Negative Prompt</label>
                             <button type="button" onClick={onOpenNegativeGuide} className="text-accent rounded-full hover:bg-accent/20 w-4 h-4 text-xs flex items-center justify-center font-bold" title="Open Negative Prompt Guide">?</button>
                        </div>
                        <button
                            type="button"
                            onClick={onSuggestNegativePrompt}
                            disabled={isLoading || isSuggestingNegative || !prompt.trim()}
                            className="text-xs font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1 disabled:text-text-secondary/50 disabled:cursor-not-allowed"
                            title="Suggest a negative prompt based on your core prompt"
                        >
                            {isSuggestingNegative ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm-1 6a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1 3a1 1 0 00-1 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 001-1zm-1-4a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            Suggest
                        </button>
                    </div>
                    <input
                        id="negativePrompt"
                        type="text"
                        value={config.negativePrompt}
                        onChange={(e) => setConfig(prev => ({ ...prev, negativePrompt: e.target.value }))}
                        placeholder="e.g., text, watermark, blurry, low quality"
                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent disabled:bg-bg-tertiary/50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    />
                </div>
            )}
             {safetyCheckResult && (
                <SafetyCheckResultDisplay 
                    result={safetyCheckResult} 
                    onApplySuggestion={(suggestion) => setPrompt(suggestion)}
                    onDismiss={() => setSafetyCheckResult(null)}
                />
            )}
        </FormSection>
        
        {/* Artistic Styles Section */}
        <FormSection title="Artistic Styles & Presets" actions={
            <button type="button" onClick={onOpenStyleManager} className="text-sm font-medium text-accent hover:text-text-primary transition-colors">Manage Styles</button>
        }>
            <div ref={styleDropdownRef} className="relative">
                <button type="button" onClick={() => setIsStyleDropdownOpen(prev => !prev)} disabled={isLoading} className="w-full p-3 bg-input-bg border border-input-border rounded-lg text-left flex justify-between items-center">
                    <span className="truncate text-input-text">
                        {config.styles.length > 0 
                            ? `${config.styles.length} style(s) selected` 
                            : `Select from ${allStyles.length} available styles...`
                        }
                    </span>
                    <svg className={`w-5 h-5 text-text-secondary/70 transition-transform ${isStyleDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isStyleDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-bg-secondary border border-border-primary rounded-lg shadow-xl max-h-80 flex flex-col">
                        <div className="p-2 border-b border-border-primary">
                            <input
                                type="text"
                                placeholder="Search styles..."
                                value={styleSearchTerm}
                                onChange={(e) => setStyleSearchTerm(e.target.value)}
                                className="w-full p-2 bg-bg-tertiary border border-border-primary/50 rounded-md text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent"
                            />
                        </div>
                         {savedPresets.length > 0 && (
                            <div className="p-2 border-b border-border-primary">
                                <h4 className="text-xs font-bold text-text-secondary/70 px-2 mb-1">PRESETS</h4>
                                <div className="flex flex-wrap gap-1">
                                    {savedPresets.map(preset => (
                                        <button key={preset.id} type="button" onClick={() => onApplyPreset(preset.styles)} className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full hover:bg-accent/40">
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )}
                        <div className="overflow-y-auto flex-grow p-1">
                            {filteredStyles.map(style => (
                                <label key={style.value} className="flex items-center p-2 rounded-md hover:bg-bg-tertiary cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.styles.includes(style.value)}
                                        onChange={() => handleStyleChange(style.value)}
                                        className="h-4 w-4 rounded bg-bg-tertiary border-border-primary text-accent focus:ring-accent"
                                    />
                                    <span className="ml-3 text-sm text-text-primary">{style.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </FormSection>

        {/* Advanced Prompting Section */}
        <FormSection title="Advanced Prompting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                  <label htmlFor="prefix" className="block text-sm font-medium text-text-secondary mb-1">Prompt Prefix (Style/Medium)</label>
                  <input
                      id="prefix"
                      type="text"
                      value={config.promptPrefix}
                      onChange={(e) => setConfig(prev => ({ ...prev, promptPrefix: e.target.value }))}
                      placeholder="e.g., An oil painting of..."
                      className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent"
                      disabled={isLoading}
                  />
              </div>
              <div>
                  <label htmlFor="suffix" className="block text-sm font-medium text-text-secondary mb-1">Prompt Suffix (Keywords/Details)</label>
                  <input
                      id="suffix"
                      type="text"
                      value={config.promptSuffix}
                      onChange={(e) => setConfig(prev => ({ ...prev, promptSuffix: e.target.value }))}
                      placeholder="e.g., cinematic lighting, hyperdetailed, 8k"
                      className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent"
                      disabled={isLoading}
                  />
              </div>
               <div>
                  <label htmlFor="detail" className="block text-sm font-medium text-text-secondary mb-1">
                      Detail Level: <span className="font-normal text-accent">{detailLevelLabels[config.detailLevel.toString()]}</span>
                  </label>
                  <input
                      id="detail"
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      value={config.detailLevel}
                      onChange={(e) => setConfig(prev => ({...prev, detailLevel: parseInt(e.target.value)}))}
                      className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
                      disabled={isLoading}
                  />
                  <div className="flex justify-between text-xs text-text-secondary/70 px-1 mt-1">
                    <span>Abstract</span>
                    <span>Default</span>
                    <span>Ornate</span>
                  </div>
              </div>
               <div>
                  <label htmlFor="intensity" className="block text-sm font-medium text-text-secondary mb-1">
                      Style Intensity: <span className="font-normal text-accent">{intensityLevelLabels[config.styleIntensity.toString()]}</span>
                  </label>
                  <input
                      id="intensity"
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={config.styleIntensity}
                      onChange={(e) => setConfig(prev => ({...prev, styleIntensity: parseInt(e.target.value)}))}
                      className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
                      disabled={isLoading}
                  />
                   <div className="flex justify-between text-xs text-text-secondary/70 px-1 mt-1">
                    <span>Subtle</span>
                    <span>Default</span>
                    <span>Intense</span>
                  </div>
              </div>
          </div>
        </FormSection>

        {/* Model & Output Settings */}
        <FormSection title="Model & Output Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-text-secondary mb-1">Model</label>
                    <select
                        id="model"
                        value={config.model}
                        onChange={handleModelChange}
                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent"
                        disabled={isLoading}
                    >
                        {imageModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                {capabilities.aspectRatio && !isComfyUi && (
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-text-secondary mb-1">Aspect Ratio</label>
                        <select
                            id="aspectRatio"
                            value={config.aspectRatio}
                            onChange={(e) => setConfig(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
                            className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent"
                            disabled={isLoading}
                        >
                            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="numImages" className="block text-sm font-medium text-text-secondary mb-1">
                        Number of Images: <span className="font-normal text-accent">{config.numberOfImages}</span>
                    </label>
                    <input
                        id="numImages"
                        type="range"
                        min="1"
                        max={capabilities.maxImages}
                        value={config.numberOfImages}
                        onChange={(e) => setConfig(prev => ({ ...prev, numberOfImages: parseInt(e.target.value, 10) }))}
                        className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
                        disabled={isLoading || capabilities.batch}
                    />
                </div>
                {capabilities.batch && (
                     <div>
                        <label htmlFor="batchSize" className="block text-sm font-medium text-text-secondary mb-1">
                            Batch Size: <span className="font-normal text-accent">{config.batchSize}</span>
                        </label>
                        <input
                            id="batchSize"
                            type="range"
                            min="1"
                            max={capabilities.maxBatch}
                            value={config.batchSize}
                            onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value, 10) }))}
                            className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
                            disabled={isLoading}
                        />
                    </div>
                )}
            </div>
        </FormSection>

        {/* ComfyUI Settings Section */}
        {isComfyUi && (
           <FormSection title="ComfyUI Local Settings" actions={
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onOpenComfyUIEmbed} className="text-sm font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 7a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm2-2a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg>
                        Open Full Interface
                    </button>
                    <button type="button" onClick={onOpenComfyGuide} className="text-sm font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        Setup Guide
                    </button>
                </div>
           }>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="comfy-address" className="block text-sm font-medium text-text-secondary mb-1">Server Address & Status</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="comfy-address"
                                type="text"
                                value={comfyUiServerAddress}
                                onChange={(e) => setComfyUiServerAddress(e.target.value)}
                                placeholder="http://127.0.0.1:8188"
                                className="flex-grow p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={onCheckComfyConnection}
                                disabled={isLoading || comfyUiStatus === 'checking'}
                                className="px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center"
                            >
                                {comfyUiStatus === 'checking' 
                                    ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                                    : 'Check'
                                }
                            </button>
                             <span className={`flex items-center text-sm font-medium ${comfyUiStatus === 'online' ? 'text-success' : 'text-danger'}`}>
                                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${comfyUiStatus === 'online' ? 'bg-success' : 'bg-danger'}`}></span>
                                {comfyUiStatus === 'online' ? 'Online' : 'Offline'}
                             </span>
                        </div>
                    </div>

                    {comfyUiStatus === 'online' && (
                        <>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="comfy-workflow" className="block text-sm font-medium text-text-secondary">Workflow</label>
                                        <button type="button" onClick={onOpenWorkflowManager} className="text-xs font-medium text-accent hover:text-text-primary transition-colors">Manage</button>
                                    </div>
                                    <select
                                        id="comfy-workflow"
                                        value={selectedComfyUiWorkflowId}
                                        onChange={(e) => setSelectedComfyUiWorkflowId(e.target.value)}
                                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent"
                                        disabled={isLoading || comfyUiStatus !== 'online'}
                                    >
                                        {comfyUiWorkflows.map(wf => <option key={wf.id} value={wf.id}>{wf.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="comfy-checkpoint" className="block text-sm font-medium text-text-secondary">
                                            Checkpoint Model
                                        </label>
                                        <button type="button" onClick={onOpenCheckpointManager} className="text-xs font-medium text-accent hover:text-text-primary transition-colors">Manage</button>
                                    </div>
                                    <select
                                        id="comfy-checkpoint"
                                        value={selectedComfyUiCheckpoint}
                                        onChange={(e) => setSelectedComfyUiCheckpoint(e.target.value)}
                                        className={`w-full p-2 bg-input-bg border border-input-border rounded-lg focus:ring-2 focus:ring-accent ${!selectedComfyUiCheckpoint ? 'text-input-placeholder/80' : 'text-input-text'}`}
                                        disabled={isLoading || comfyUiCheckpoints.length === 0 || comfyUiStatus !== 'online'}
                                        required={isComfyUi}
                                    >
                                        <option value="" disabled>
                                            {comfyUiCheckpoints.length === 0 
                                                ? 'No models found' 
                                                : visibleCheckpoints.length === 0
                                                    ? `All ${comfyUiCheckpoints.length} models are hidden`
                                                    : `Select from ${visibleCheckpoints.length} available model(s)...`
                                            }
                                        </option>
                                        {visibleCheckpoints.map(cp => (
                                            <option key={cp} value={cp}>{cp}</option>
                                        ))}
                                    </select>
                                </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-primary/50">
                                <div>
                                    <label htmlFor="width" className="block text-sm font-medium text-text-secondary mb-1">Width</label>
                                    <input
                                        id="width"
                                        type="number"
                                        step="64"
                                        value={config.width}
                                        onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value, 10) || 1024 }))}
                                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-text-secondary mb-1">Height</label>
                                    <input
                                        id="height"
                                        type="number"
                                        step="64"
                                        value={config.height}
                                        onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value, 10) || 1024 }))}
                                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cfg" className="block text-sm font-medium text-text-secondary mb-1">
                                        CFG Scale
                                    </label>
                                    <input
                                        id="cfg"
                                        type="number"
                                        min="1"
                                        max="30"
                                        step="0.1"
                                        value={config.cfg}
                                        onChange={(e) => {
                                            const parsed = parseFloat(e.target.value);
                                            if (!isNaN(parsed)) {
                                                setConfig(prev => ({ ...prev, cfg: parsed }));
                                            }
                                        }}
                                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            {/* LoRA Section */}
                            {(workflowAnalysis.hasRgthreeLoader || workflowAnalysis.loraLoaderNodeIds.length > 0) && (
                                <div className="space-y-2 pt-4 border-t border-border-primary/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-text-secondary">LoRAs</label>
                                        {workflowAnalysis.hasRgthreeLoader && (
                                            <button
                                                type="button"
                                                onClick={handleAddLoRA}
                                                disabled={isLoading || comfyUiLoras.length === 0}
                                                className="text-xs font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1 disabled:text-text-secondary/50 disabled:cursor-not-allowed"
                                            >
                                                + Add LoRA ({config.loras.length})
                                            </button>
                                        )}
                                    </div>

                                    {workflowAnalysis.hasRgthreeLoader && (
                                        <div className="space-y-3">
                                            {comfyUiLoras.length === 0 && config.loras.length === 0 && <p className="text-xs text-text-secondary/70">No LoRAs found on ComfyUI server.</p>}
                                            {config.loras.map((lora) => (
                                                <div key={lora.id} className="p-3 bg-bg-primary/50 rounded-lg space-y-3 animate-fade-in">
                                                     <div className="flex items-center gap-2">
                                                         <select
                                                             value={lora.name}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'name', e.target.value)}
                                                             className="flex-grow p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent text-sm"
                                                             disabled={isLoading}
                                                         >
                                                             <option value="" disabled>Select a LoRA...</option>
                                                             {comfyUiLoras.map(name => <option key={name} value={name}>{name}</option>)}
                                                         </select>
                                                         <button
                                                             type="button"
                                                             onClick={() => handleRemoveLoRA(lora.id)}
                                                             className="text-danger/80 hover:text-danger p-2 rounded-md flex justify-center items-center flex-shrink-0"
                                                             title="Remove LoRA"
                                                             disabled={isLoading}
                                                         >
                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                                         </button>
                                                     </div>
                                                     <div className="grid grid-cols-5 gap-2 items-center">
                                                         <label htmlFor={`lora-strength-${lora.id}`} className="col-span-2 text-sm text-text-secondary/90">Strength</label>
                                                         <input
                                                             id={`lora-strength-${lora.id}`}
                                                             type="range" min="-5" max="5" step="0.01"
                                                             value={lora.strength}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'strength', parseFloat(e.target.value))}
                                                             className="col-span-2 w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb"
                                                             disabled={isLoading}
                                                         />
                                                         <input
                                                             type="number" step="0.01"
                                                             value={lora.strength}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'strength', parseFloat(e.target.value))}
                                                             className="col-span-1 w-full p-1 bg-input-bg border border-input-border rounded-md text-input-text text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                             disabled={isLoading}
                                                         />
                                                     </div>
                                                 </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!workflowAnalysis.hasRgthreeLoader && workflowAnalysis.loraLoaderNodeIds.length > 0 && (
                                         <div className="space-y-3">
                                            {config.loras.map((lora, index) => (
                                                 <div key={lora.id} className="p-3 bg-bg-primary/50 rounded-lg space-y-3 animate-fade-in">
                                                     <p className="text-xs font-semibold text-text-secondary/80">LoRA Slot #{index + 1}</p>
                                                     <div className="flex items-center gap-2">
                                                         <select
                                                             value={lora.name}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'name', e.target.value)}
                                                             className="flex-grow p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent text-sm"
                                                             disabled={isLoading}
                                                         >
                                                             <option value="">(None)</option>
                                                             {comfyUiLoras.map(name => <option key={name} value={name}>{name}</option>)}
                                                         </select>
                                                     </div>
                                                     <div className="grid grid-cols-5 gap-2 items-center">
                                                         <label htmlFor={`lora-strength-slot-${lora.id}`} className="col-span-2 text-sm text-text-secondary/90">Strength</label>
                                                         <input
                                                             id={`lora-strength-slot-${lora.id}`}
                                                             type="range" min="-5" max="5" step="0.01"
                                                             value={lora.strength}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'strength', parseFloat(e.target.value))}
                                                             className="col-span-2 w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb"
                                                             disabled={isLoading}
                                                         />
                                                         <input
                                                             type="number" step="0.01"
                                                             value={lora.strength}
                                                             onChange={(e) => handleUpdateLoRA(lora.id, 'strength', parseFloat(e.target.value))}
                                                             className="col-span-1 w-full p-1 bg-input-bg border border-input-border rounded-md text-input-text text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                             disabled={isLoading}
                                                         />
                                                     </div>
                                                 </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-end gap-4 pt-4 border-t border-border-primary/50">
                                <div className="flex-grow w-full">
                                    <label htmlFor="comfy-seed" className="block text-sm font-medium text-text-secondary mb-1">Seed</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="comfy-seed"
                                            type="number"
                                            value={config.comfyUiSeed}
                                            onChange={(e) => setConfig(prev => ({ ...prev, comfyUiSeed: Number(e.target.value) }))}
                                            className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text placeholder-input-placeholder/60 focus:ring-2 focus:ring-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, comfyUiSeed: Math.floor(Math.random() * 1e15) }))}
                                            disabled={isLoading}
                                            className="p-2 font-semibold text-text-primary bg-bg-tertiary rounded-md hover:bg-accent hover:text-white transition-colors flex items-center justify-center h-full aspect-square"
                                            title="Randomize Seed"
                                        >
                                            <span className="text-lg" role="img" aria-label="dice">🎲</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex-shrink-0">
                                    <label htmlFor="comfy-seed-control" className="block text-sm font-medium text-text-secondary mb-1">Control After Generate</label>
                                    <select
                                        id="comfy-seed-control"
                                        value={config.comfyUiSeedControl}
                                        onChange={(e) => setConfig(prev => ({ ...prev, comfyUiSeedControl: e.target.value as SeedControl }))}
                                        className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-input-text focus:ring-2 focus:ring-accent"
                                        disabled={isLoading}
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="increment">Increment</option>
                                        <option value="decrement">Decrement</option>
                                        <option value="randomize">Randomize</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                    {comfyUiStatus === 'online' && (
                        <ResizableComfyUIEmbed 
                            serverAddress={comfyUiServerAddress} 
                            onSyncImages={onSyncComfyImages}
                            onQueue={onQueueComfyInBackground}
                        />
                    )}
                </div>
           </FormSection>
        )}
        
        {capabilities.img2img && !isComfyUi && (
            <FormSection title="Image to Image (Img2Img)">
                 {isComfyUi ? (
                    <div className="p-3 bg-info-bg/50 text-info text-xs rounded-md border border-info/50">
                        Upload an image to use as input for your workflow. Make sure your selected workflow is designed for Image-to-Image (e.g., contains a "Load Image" node).
                    </div>
                ) : (
                    <div className="p-3 bg-info-bg/50 text-info text-xs rounded-md border border-info/50">
                        Upload an image to use as a base for your prompt. This feature uses a powerful vision model to interpret the image.
                    </div>
                )}
                {uploadedImage ? (
                    <div className="flex items-center gap-4">
                        <img src={uploadedImage.data} alt="Uploaded preview" className="h-20 w-20 object-cover rounded-lg border-2 border-border-primary" />
                        <div className="flex-grow">
                            <p className="text-sm text-text-primary truncate">{uploadedImage.mimeType}</p>
                            <button type="button" onClick={handleClearImage} className="text-sm text-danger hover:underline">Remove Image</button>
                        </div>
                    </div>
                ) : (
                    <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="block w-full text-sm text-text-secondary/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bg-tertiary file:text-text-primary hover:file:bg-bg-tertiary/80"/>
                )}
            </FormSection>
        )}


      <div className="flex justify-center mt-4">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full md:w-1/2 flex justify-center items-center p-4 text-lg font-bold text-white bg-accent rounded-lg shadow-lg hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating...
            </>
          ) : isComfyUi ? (
              'Queue Prompt'
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </form>
  );
};

export default ImagePromptForm;