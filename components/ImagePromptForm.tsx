import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ImageConfig, AspectRatio, ArtisticStyle, ImageModel, SavedStylePreset, CustomStylePreset, SafetyCheckResult, ComfyUIWorkflowPreset } from '../types';
import { randomPrompts } from '../lib/prompts';

interface ImagePromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  config: ImageConfig;
  setConfig: React.Dispatch<React.SetStateAction<ImageConfig>>;
  onSubmit: () => void;
  isLoading: boolean;
  onOpenStyleManager: () => void;
  savedPresets: SavedStylePreset[];
  customStyles: CustomStylePreset[];
  onApplyPreset: (styles: string[]) => void;
  uploadedImage: { data: string; mimeType: string } | null;
  setUploadedImage: (image: { data: string; mimeType: string } | null) => void;
  onEnhancePrompt: () => void;
  isEnhancing: boolean;
  onCheckSafety: () => void;
  isCheckingSafety: boolean;
  safetyCheckResult: SafetyCheckResult | null;
  setSafetyCheckResult: (result: SafetyCheckResult | null) => void;
  // ComfyUI Props
  comfyUiServerAddress: string;
  setComfyUiServerAddress: (value: string) => void;
  onOpenComfyGuide: () => void;
  onOpenComfyUIEmbed: () => void;
  comfyUiStatus: 'idle' | 'checking' | 'online' | 'offline';
  onCheckComfyConnection: () => void;
  comfyUiWorkflows: ComfyUIWorkflowPreset[];
  selectedComfyUiWorkflowId: string;
  setSelectedComfyUiWorkflowId: (id: string) => void;
  onOpenWorkflowManager: () => void;
  comfyUiCheckpoints: string[];
  selectedComfyUiCheckpoint: string;
  setSelectedComfyUiCheckpoint: (value: string) => void;
  comfyUiInputImage: string | null;
  setComfyUiInputImage: (image: string | null) => void;
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
  { value: "cel-shaded-illustration", label: "Cel-Shaded Illustration" },
  { value: "certified-rat-style", label: "Certified Rat's Style" },
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
  { value: "danbooru-style", label: "Danbooru Tag Style" },
  { value: "double-exposure", label: "Double Exposure" },
  { value: "e621-style", label: "e621 Tag Style" },
  { value: "ecaj-style", label: "Ecaj's Style" },
  { value: "ethereal-anime-painting", label: "Ethereal Anime Painting" },
  { value: "fantasy", label: "Fantasy Art" },
  { value: "film-noir", label: "Film Noir" },
  { value: "film-grain", label: "Film Grain" },
  { value: "flatline-illus", label: "Flatline-Illus (Niji)" },
  { value: "ghibli-esque", label: "Ghibli-esque" },
  { value: "glassmorphism", label: "Glassmorphism" },
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
  { value: "splatter-art", label: "Splatter Art" },
  { value: "steampunk", label: "Steampunk" },
  { value: "sticker-style", label: "Sticker Style" },
  { value: "tribal-art", label: "Tribal Art" },
  { value: "ukiyo-e", label: "Ukiyo-e" },
  { value: "valentine-designs", label: "Valentinedesigns' Style" },
  { value: "vaporwave", label: "Vaporwave" },
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
    'gemini-2.5-flash-image-preview': { maxImages: 1, aspectRatio: true, img2img: true, batch: false },
    'comfyui-local': { maxImages: 1, aspectRatio: false, img2img: true, batch: false },
};

const detailLevelLabels: Record<string, string> = {
  '-3': 'Abstract',
  '-2': 'Minimalist',
  '-1': 'Low Detail',
  '0': 'None (Default)',
  '1': 'Detailed',
  '2': 'Highly Detailed',
  '3': 'Ornate / Hyperdetailed',
};

const intensityLevelLabels: Record<string, string> = {
  '-5': 'Very Subtle (-5)',
  '-4': 'Subtle (-4)',
  '-3': 'Understated (-3)',
  '-2': 'Softened (-2)',
  '-1': 'Less Intense (-1)',
  '0': 'Default (0)',
  '1': 'Enhanced (+1)',
  '2': 'Vibrant (+2)',
  '3': 'Intense (+3)',
  '4': 'Very Intense (+4)',
  '5': 'Dramatic (+5)',
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
    prompt, setPrompt, config, setConfig, onSubmit, isLoading, onOpenStyleManager, 
    savedPresets, customStyles, onApplyPreset, uploadedImage, setUploadedImage,
    onEnhancePrompt, isEnhancing, onCheckSafety, isCheckingSafety, safetyCheckResult, setSafetyCheckResult,
    comfyUiServerAddress, setComfyUiServerAddress, onOpenComfyGuide, onOpenComfyUIEmbed,
    comfyUiStatus, onCheckComfyConnection, comfyUiWorkflows, selectedComfyUiWorkflowId,
    setSelectedComfyUiWorkflowId, onOpenWorkflowManager, comfyUiCheckpoints, 
    selectedComfyUiCheckpoint, setSelectedComfyUiCheckpoint,
    comfyUiInputImage, setComfyUiInputImage
}) => {
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [styleSearchTerm, setStyleSearchTerm] = useState("");
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const [isWorkflowImageCompatible, setIsWorkflowImageCompatible] = useState(false);

  
  const isComfyUi = config.model === 'comfyui-local';
  const capabilities = modelCapabilities[config.model];
  
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
    // Check if the selected ComfyUI workflow supports image input
    if (isComfyUi && comfyUiWorkflows.length > 0) {
      const selectedWorkflow = comfyUiWorkflows.find(w => w.id === selectedComfyUiWorkflowId);
      if (selectedWorkflow?.workflowJson) {
        try {
          const workflow = JSON.parse(selectedWorkflow.workflowJson);
          const hasLoadImageNode = Object.values(workflow).some((node: any) => 
            node.class_type === 'LoadImage' || node._meta?.title === 'Load Image'
          );
          setIsWorkflowImageCompatible(hasLoadImageNode);
        } catch (e) {
          setIsWorkflowImageCompatible(false); // Invalid JSON
        }
      } else {
        setIsWorkflowImageCompatible(false);
      }
    }
  }, [isComfyUi, selectedComfyUiWorkflowId, comfyUiWorkflows]);

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

  const handleComfyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComfyUiInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomPrompt = () => {
    const random = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(random);
    setSafetyCheckResult(null);
  };
  
  const handleClearImage = () => {
    setUploadedImage(null);
    if (capabilities.img2img === false) {
      setConfig(prev => ({...prev, model: 'imagen-4.0-generate-001'}));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6 animate-slide-up">
        {/* Core Prompt Section */}
        <FormSection title="Core Prompt">
             <div className="relative">
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                        if (safetyCheckResult) setSafetyCheckResult(null);
                    }}
                    placeholder="e.g., A majestic bioluminescent jellyfish floating through a starry nebula..."
                    className="w-full h-28 p-3 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent resize-none pr-32"
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
            {config.model !== 'imagen-4.0-generate-001' && (
                <div>
                    <label htmlFor="negativePrompt" className="block text-sm font-medium text-text-secondary mb-1">Negative Prompt</label>
                    <input
                        id="negativePrompt"
                        type="text"
                        value={config.negativePrompt}
                        onChange={(e) => setConfig(prev => ({ ...prev, negativePrompt: e.target.value }))}
                        placeholder="e.g., text, watermark, blurry, low quality"
                        className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent disabled:bg-bg-tertiary/50 disabled:cursor-not-allowed"
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
                <button type="button" onClick={() => setIsStyleDropdownOpen(prev => !prev)} disabled={isLoading} className="w-full p-3 bg-bg-secondary/80 border border-border-primary rounded-lg text-left flex justify-between items-center">
                    <span className="truncate text-text-primary">
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
                      className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent"
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
                      className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent"
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
                      min="-3"
                      max="3"
                      step="1"
                      value={config.detailLevel}
                      onChange={(e) => setConfig(prev => ({...prev, detailLevel: parseInt(e.target.value)}))}
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
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
                      min="-5"
                      max="5"
                      step="1"
                      value={config.styleIntensity}
                      onChange={(e) => setConfig(prev => ({...prev, styleIntensity: parseInt(e.target.value)}))}
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
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
                        onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value as ImageModel }))}
                        className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent"
                        disabled={isLoading}
                    >
                        {imageModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                {capabilities.aspectRatio && (
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-text-secondary mb-1">Aspect Ratio</label>
                        <select
                            id="aspectRatio"
                            value={config.aspectRatio}
                            onChange={(e) => setConfig(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
                            className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent"
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
                        className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
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
                            className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed"
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
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
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
                                className="flex-grow p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent"
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
                           <div>
                                <label htmlFor="comfy-workflow" className="block text-sm font-medium text-text-secondary mb-1">Workflow</label>
                                 <div className="flex items-center gap-2">
                                    <select
                                        id="comfy-workflow"
                                        value={selectedComfyUiWorkflowId}
                                        onChange={(e) => setSelectedComfyUiWorkflowId(e.target.value)}
                                        className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent"
                                        disabled={isLoading}
                                    >
                                        {comfyUiWorkflows.map(wf => <option key={wf.id} value={wf.id}>{wf.name}</option>)}
                                    </select>
                                    <button type="button" onClick={onOpenWorkflowManager} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md">Manage</button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="comfy-checkpoint" className="block text-sm font-medium text-text-secondary mb-1">Checkpoint Model</label>
                                <select
                                    id="comfy-checkpoint"
                                    value={selectedComfyUiCheckpoint}
                                    onChange={(e) => setSelectedComfyUiCheckpoint(e.target.value)}
                                    className="w-full p-2 bg-bg-secondary/80 border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent"
                                    disabled={isLoading || comfyUiCheckpoints.length === 0}
                                >
                                    {comfyUiCheckpoints.length > 0 ? (
                                        comfyUiCheckpoints.map(cp => <option key={cp} value={cp}>{cp}</option>)
                                    ) : (
                                        <option>No models found</option>
                                    )}
                                </select>
                            </div>
                            
                            <div className="relative">
                                <label htmlFor="comfy-image-upload" className="block text-sm font-medium text-text-secondary mb-1">
                                    Input Image (Optional)
                                    <span className={`inline-block ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${isWorkflowImageCompatible ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`} title={isWorkflowImageCompatible ? 'Selected workflow supports image input' : 'Selected workflow does not have a LoadImage node'}>
                                      {isWorkflowImageCompatible ? '✔️ Compatible' : '⚠️ Incompatible'}
                                    </span>
                                </label>
                                <input id="comfy-image-upload" type="file" accept="image/png, image/jpeg" onChange={handleComfyImageUpload} className="block w-full text-sm text-text-secondary/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bg-tertiary file:text-text-primary hover:file:bg-bg-tertiary/80" disabled={!isWorkflowImageCompatible}/>
                                {comfyUiInputImage && (
                                     <div className="mt-2 flex items-center gap-2">
                                        <img src={comfyUiInputImage} alt="ComfyUI input preview" className="h-16 w-16 object-cover rounded-md border border-border-primary"/>
                                        <button type="button" onClick={() => setComfyUiInputImage(null)} className="text-danger hover:underline text-xs">Clear</button>
                                     </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
           </FormSection>
        )}
        
        {/* Img2Img Section - Only for Cloud Models with the capability */}
        {capabilities.img2img && !isComfyUi && (
            <FormSection title="Image to Image (Img2Img)">
                <div className="p-3 bg-info-bg/50 text-info text-xs rounded-md border border-info/50">
                    Upload an image to use as a base for your prompt. This feature uses a powerful vision model to interpret the image.
                </div>
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
          disabled={isLoading || isComfyUi}
          className="w-full md:w-1/2 flex justify-center items-center p-4 text-lg font-bold text-white bg-accent rounded-lg shadow-lg hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating...
            </>
          ) : isComfyUi ? (
            'Open Full Interface To Generate'
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </form>
  );
};

export default ImagePromptForm;