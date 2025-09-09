


import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageConfig, SavedStylePreset, CustomStylePreset, SafetyCheckResult, CustomTheme, StatusMessage as StatusMessageProps, ComfyUIWorkflowPreset, GenerationHistoryEntry, TagCategories, GenerationRecipe } from '../types';
import * as geminiService from '../services/geminiService';
import * as comfyuiService from '../services/comfyuiService';
import * as dbService from '../services/dbService';
import Header from './Header';
import ImagePromptForm from './ImagePromptForm';
import ImageDisplay from './ImageDisplay';
import StatusMessage from './StatusMessage';
import Footer from './Footer';
import useLocalStorage from '../hooks/useLocalStorage';
import StyleManager from './StyleManager';
import MagicEditModal from './MagicEditModal';
import { themes } from '../lib/themes';
import ThemeEditor from './ThemeEditor';
import ComfyUIGuideModal from './ComfyUIGuideModal';
import ComfyUIWorkflowManager from './ComfyUIWorkflowManager';
import ComfyUIEmbedModal from './ComfyUIEmbedModal';
import HistoryModal from './HistoryModal';
import TagManagerModal from './TagManagerModal';
import { initialManagedTags, popularCommunityTags } from '../lib/tags';
import NegativePromptGuideModal from './NegativePromptGuideModal';
import CheckpointManagerModal from './CheckpointManagerModal';
import WorkflowPreviewModal from './WorkflowPreviewModal';
import RecipeManagerModal from './RecipeManagerModal';
import { getComfyPrompt } from '../lib/promptBuilder';

const MAX_HISTORY_SIZE = 50; // Cap history to prevent storage quota errors

const ratGifs = [
  {
    id: 'jumpingAttack',
    src: 'https://media1.tenor.com/m/oaaVQQEe67IAAAAd/rat-attack-rat.gif',
    alt: 'rat attacking screen',
    position: 'bottom-right-stack-1',
  },
  {
    id: 'ratiatella',
    src: 'https://media1.tenor.com/m/5xN_Eg9CCacAAAAd/ratiatella.gif',
    alt: 'ratiatella the rat',
    position: 'bottom-right-stack-2',
  },
  {
    id: 'danceParty',
    src: 'https://media.tenor.com/V9XG4Lp_SN0AAAAi/rat-dance.gif',
    alt: 'rat dance party',
    position: 'bottom-right-stack-3',
  },
  {
    id: 'sleepyTop',
    src: 'https://media1.tenor.com/m/nU3MsvQSc1oAAAAd/rat-sleepy.gif',
    alt: 'sleepy rat',
    position: 'bottom-right-stack-4',
  },
  {
    id: 'fatRat',
    src: 'https://media1.tenor.com/m/gW0h9705OEAAAAAd/rat-fat-rat.gif',
    alt: 'fat rat',
    position: 'bottom-left-stack-1',
  },
  {
    id: 'sofiaRat',
    src: 'https://media.tenor.com/FeZAdpEBTVYAAAAi/rat-sofia-rat.gif',
    alt: 'sofia rat',
    position: 'bottom-left-stack-2',
  },
  {
    id: 'raspberryRat',
    src: 'https://media1.tenor.com/m/tNMfrJFRIQEAAAAC/rat.gif',
    alt: 'rat eating raspberry',
    position: 'bottom-left-stack-3',
  },
  {
    id: 'kingRat',
    src: 'https://media1.tenor.com/m/L2x_EllQEjEAAAAd/rat.gif',
    alt: 'rat with a crown',
    position: 'bottom-left-stack-4',
  },
  {
    id: 'attackMeme',
    src: 'https://media.tenor.com/b_sEvwmx3-YAAAAi/rat-meme.gif',
    alt: 'attack rat',
    className: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 z-50 pointer-events-none',
    position: 'center',
  },
  {
    id: 'sleepy',
    src: 'https://media.tenor.com/XpA5k-l8iGgAAAAi/rat-yawn.gif',
    alt: 'sleepy rat',
    className: 'fixed top-20 right-10 h-32 w-32 z-50 pointer-events-none rounded-full',
    position: 'top-right',
  },
];


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [config, setConfig] = useState<ImageConfig>({
    numberOfImages: 1,
    batchSize: 1,
    aspectRatio: "1:1",
    styles: [],
    negativePrompt: "",
    promptPrefix: "",
    promptSuffix: "",
    model: "gemini-2.5-flash-image-preview",
    detailLevel: 0,
    styleIntensity: 0,
    selectedComfyUiWorkflowId: 'default-t2i-simple',
    selectedComfyUiCheckpoint: '',
    width: 1024,
    height: 1024,
    cfg: 5.0,
    comfyUiSeed: Math.floor(Math.random() * 1e15),
    comfyUiSeedControl: 'fixed',
    loras: [{ id: crypto.randomUUID(), name: '', strength: 1.0 }],
  });
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isSuggestingNegative, setIsSuggestingNegative] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessageProps | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [processingIndex, setProcessingIndex] = useState<string | null>(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState<boolean>(false);
  const [safetyCheckResult, setSafetyCheckResult] = useState<SafetyCheckResult | null>(null);
  
  // ComfyUI State
  const [comfyUiServerAddress, setComfyUiServerAddress] = useLocalStorage<string>('comfy-address', 'http://127.0.0.1:8188');
  const [isComfyGuideOpen, setIsComfyGuideOpen] = useState(false);
  const [comfyUiStatus, setComfyUiStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [comfyUiWorkflows, setComfyUiWorkflows] = useLocalStorage<ComfyUIWorkflowPreset[]>('comfy-workflows', [
    { id: 'default-t2i-simple', name: 'Default Text-to-Image', workflowJson: comfyuiService.DEFAULT_T2I_SIMPLE_WORKFLOW_API },
    { id: 'default-t2i-single-lora', name: 'Default Text-to-Image (Single LoRA)', workflowJson: comfyuiService.DEFAULT_T2I_SINGLE_LORA_WORKFLOW_API },
    { id: 'default-t2i-rgthree', name: 'Default Text-to-Image (rgthree LoRA)', workflowJson: comfyuiService.DEFAULT_T2I_WORKFLOW_API },
    { id: 'default-i2i', name: 'Default Image-to-Image', workflowJson: comfyuiService.DEFAULT_I2I_WORKFLOW_API },
  ]);
  const [isWorkflowManagerOpen, setIsWorkflowManagerOpen] = useState(false);
  const [workflowToPreview, setWorkflowToPreview] = useState<string | null>(null);
  const [comfyUiCheckpoints, setComfyUiCheckpoints] = useState<string[]>([]);
  const [comfyUiLoras, setComfyUiLoras] = useLocalStorage<string[]>('comfy-loras', []);
  const [hiddenCheckpoints, setHiddenCheckpoints] = useLocalStorage<string[]>('hidden-comfy-checkpoints', []);
  const [isComfyEmbedOpen, setIsComfyEmbedOpen] = useState(false);
  const [sendingToComfyId, setSendingToComfyId] = useState<string | null>(null);
  const [nodeToCopy, setNodeToCopy] = useState<string | null>(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [magicEditState, setMagicEditState] = useState<{ isOpen: boolean; imageId: string | null; imageData: string | null; isLoading: boolean }>({
    isOpen: false,
    imageId: null,
    imageData: null,
    isLoading: false,
  });

  const mainRef = useRef<HTMLElement>(null);

  const [savedPresets, setSavedPresets] = useLocalStorage<SavedStylePreset[]>('style-presets', []);
  const [customStyles, setCustomStyles] = useLocalStorage<CustomStylePreset[]>('custom-styles', []);
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);
  
  const [recipes, setRecipes] = useLocalStorage<GenerationRecipe[]>('generation-recipes', []);
  const [defaultRecipeId, setDefaultRecipeId] = useLocalStorage<string | null>('default-recipe-id', null);
  const [isRecipeManagerOpen, setIsRecipeManagerOpen] = useState(false);
  
  const [managedTags, setManagedTags] = useLocalStorage<TagCategories>('managed-tags', initialManagedTags);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isNegativeGuideOpen, setIsNegativeGuideOpen] = useState(false);
  const [isCheckpointManagerOpen, setIsCheckpointManagerOpen] = useState(false);

  const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('custom-themes', []);
  const [theme, setTheme] = useLocalStorage<string>('app-theme', 'rat');
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Partial<CustomTheme> | null>(null);
  
  const [ratClickCount, setRatClickCount] = useState(0);
  const [visibleRatGifs, setVisibleRatGifs] = useState<string[]>([]);
  const [resetTargetClicks, setResetTargetClicks] = useState<number | null>(null);
  const [resetCurrentClicks, setResetCurrentClicks] = useState(0);

  // Load history from IndexedDB on startup
  useEffect(() => {
    const loadHistory = async () => {
        try {
            const loadedHistory = await dbService.getAllHistory();
            setHistory(loadedHistory.slice(0, MAX_HISTORY_SIZE));
        } catch (error) {
            console.error("Failed to load history from IndexedDB:", error);
            setStatusMessage({ text: 'Could not load generation history.', type: 'error' });
        }
    };
    loadHistory();
  }, []);

  // Load default recipe on initial app start
  useEffect(() => {
    // We check if history is empty to ensure this only runs on a fresh session,
    // not on a page reload where the user might have already changed settings.
    if (defaultRecipeId && history.length === 0) {
      const defaultRecipe = recipes.find(r => r.id === defaultRecipeId);
      if (defaultRecipe) {
        setPrompt(defaultRecipe.prompt);
        setConfig(defaultRecipe.config);
        setStatusMessage({ text: `Loaded default recipe: "${defaultRecipe.name}"`, type: 'info' });
      }
    }
  }, [defaultRecipeId, recipes]); // history is removed as it would re-trigger on generation

  // One-time sync for community tags on first load
  useEffect(() => {
    const communityTagsSyncedFlag = 'communityTagsSynced_v1'; // Versioned flag in case we want to force a re-sync later

    if (localStorage.getItem(communityTagsSyncedFlag)) {
        return; // Already synced, do nothing.
    }

    const normalizeString = (str: string) => str.toLowerCase().replace(/[\s_&]+/g, '');

    const findMatchingCategory = (filename: string, categories: string[]): string | null => {
        const normalizedFilename = normalizeString(filename.replace(/\.[^/.]+$/, "")); // remove extension
        for (const category of categories) {
            if (normalizeString(category) === normalizedFilename) {
                return category;
            }
        }
        return null;
    };
    
    // Use the updater form of setState to get the most recent tags
    setManagedTags(currentTags => {
        const updatedTags: TagCategories = JSON.parse(JSON.stringify(currentTags)); // Deep copy to avoid mutation
        const existingCategoryKeys = Object.keys(updatedTags);

        for (const category in popularCommunityTags) {
            const newTagsForCategory = popularCommunityTags[category as keyof typeof popularCommunityTags];
            const matchedCategory = findMatchingCategory(category, existingCategoryKeys);

            if (matchedCategory) {
                // Merge with existing category, avoiding duplicates
                const merged = new Set([...updatedTags[matchedCategory], ...newTagsForCategory]);
                updatedTags[matchedCategory] = Array.from(merged).sort();
            } else {
                // Add as a new category
                updatedTags[category] = Array.from(new Set(newTagsForCategory)).sort();
            }
        }
        return updatedTags;
    });

    // Inform the user and set the flag
    setStatusMessage({ text: '✨ Your tag library has been automatically updated with thousands of new community tags!', type: 'info' });
    localStorage.setItem(communityTagsSyncedFlag, 'true');
    
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleHeaderClick = () => {
    // If all GIFs are already visible, we enter reset mode.
    if (ratClickCount >= ratGifs.length) {
        let currentTarget = resetTargetClicks;
        // If this is the first click in reset mode, determine the random target.
        if (currentTarget === null) {
            currentTarget = Math.floor(Math.random() * (10 - 3 + 1)) + 3; // Random integer between 3 and 10.
            setResetTargetClicks(currentTarget);
        }

        const newResetCount = resetCurrentClicks + 1;
        setResetCurrentClicks(newResetCount);

        // If the target number of clicks is reached, reset everything.
        if (newResetCount >= currentTarget) {
            setVisibleRatGifs([]);
            setRatClickCount(0);
            setResetCurrentClicks(0);
            setResetTargetClicks(null);
        }
    } else { // Otherwise, we are in reveal mode.
        const nextCount = ratClickCount + 1;
        setRatClickCount(nextCount);
        const nextVisibleIds = ratGifs.slice(0, nextCount).map(g => g.id);
        setVisibleRatGifs(nextVisibleIds);
    }
  };

  const checkComfyConnection = useCallback(async () => {
    setComfyUiStatus('checking');
    setStatusMessage(null);
    try {
      await comfyuiService.checkServerStatus(comfyUiServerAddress);
      setComfyUiStatus('online');
      const checkpoints = await comfyuiService.getCheckpoints(comfyUiServerAddress);
      setComfyUiCheckpoints(checkpoints);
      
      const loras = await comfyuiService.getLoras(comfyUiServerAddress);
      setComfyUiLoras(loras);

      const visibleCheckpoints = checkpoints.filter(c => !hiddenCheckpoints.includes(c));
      const currentSelectionIsValid = config.selectedComfyUiCheckpoint && visibleCheckpoints.includes(config.selectedComfyUiCheckpoint);

      if (!currentSelectionIsValid) {
          // By resetting to '', we allow the dropdown to show a placeholder.
          // This prompts the user to make an explicit choice.
          setConfig(c => ({ ...c, selectedComfyUiCheckpoint: '' }));
      }
    } catch (e) {
      setComfyUiStatus('offline');
      setComfyUiCheckpoints([]);
      setComfyUiLoras([]);
      setStatusMessage({ text: 'Could not connect to ComfyUI server. Ensure it is running with --enable-cors argument.', type: 'error' });
    }
  }, [comfyUiServerAddress, config.selectedComfyUiCheckpoint, hiddenCheckpoints, setConfig]);

  useEffect(() => {
    if (config.model === 'comfyui-local' && comfyUiStatus === 'idle') {
      checkComfyConnection();
    }
  }, [config.model, comfyUiStatus, checkComfyConnection]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    let themeToApply: { colors: { [key: string]: string }, backgroundImage?: string, uiOpacity?: number };
    const baseColors = themes.dark; // Use dark as a reliable fallback

    if (previewTheme) {
        themeToApply = {
            colors: { ...baseColors, ...(previewTheme.colors || {}) },
            backgroundImage: previewTheme.backgroundImage,
            uiOpacity: previewTheme.uiOpacity,
        };
    } else {
        const activeBuiltInTheme = themes[theme];
        const activeCustomTheme = customThemes.find(t => t.id === theme);
        
        if (activeCustomTheme) {
            // Sanitize to prevent errors from old/malformed themes in localStorage
            const sanitizedColors = Object.entries(activeCustomTheme.colors).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined) {
                    acc[key as keyof typeof acc] = value;
                }
                return acc;
            }, {} as { [key: string]: string });

            themeToApply = {
                colors: { ...baseColors, ...sanitizedColors },
                backgroundImage: activeCustomTheme.backgroundImage || '',
                uiOpacity: activeCustomTheme.uiOpacity ?? 1,
            };
        } else if (activeBuiltInTheme) {
            themeToApply = { colors: activeBuiltInTheme, uiOpacity: 1, backgroundImage: '' };
        } else { 
            themeToApply = { colors: themes.dark, uiOpacity: 1, backgroundImage: '' };
            setTheme('dark'); 
        }
    }

    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(key, value);
      }
    });
    body.style.backgroundImage = themeToApply.backgroundImage ? `url(${themeToApply.backgroundImage})` : '';
    body.style.backgroundSize = 'cover'; body.style.backgroundPosition = 'center'; body.style.backgroundAttachment = 'fixed';
    root.style.setProperty('--ui-opacity', String(themeToApply.uiOpacity ?? 1));
  }, [theme, customThemes, setTheme, previewTheme]);

  const handleApiError = (err: unknown) => {
    let errorMessage = 'An unknown error occurred. Check the browser console for details.';
    let messageType: StatusMessageProps['type'] = 'error';

    // Log the full error to the console for power users to debug
    console.error("An error occurred during API call:", err);

    const message = ((err as any)?.message || '').toLowerCase();
    
    if (message.includes('api key not found')) {
        errorMessage = "Configuration Error: The application's API_KEY is missing. The app cannot function without it. Please contact the administrator.";
    } else if (message.includes('api key not valid') || message.includes('[400]')) {
        errorMessage = "Bad Request [400]. The server rejected the request. This can be caused by: 1) The application's API key is invalid or restricted. 2) Your prompt was blocked by the safety filter. Please try a different prompt.";
    } else if (message.includes('permission denied') || message.includes('api not enabled') || message.includes('[403]')) {
        errorMessage = "Permission Denied [403]. The application's API key lacks permissions. Please contact the administrator to ensure the 'Generative Language API' (or 'Vertex AI API') is enabled.";
    } else if (message.includes('quota') || message.includes('resource has been exhausted') || message.includes('[429]')) {
        errorMessage = "API Quota Exceeded. The application has made too many requests. Please wait and try again, or contact the administrator.";
        messageType = 'warning';
    } else if (message.includes('server error') || message.includes('[500]') || message.includes('[503]')) {
         errorMessage = "Google Server Error. The AI service is temporarily unavailable. This is an issue on Google's end. Please try again in a few moments.";
         messageType = 'warning';
    } else if (message.includes('did not return any images') || message.includes('prompt may have been blocked')) {
        // This catches my custom errors from geminiService
        errorMessage = "Generation failed. The prompt was likely blocked by Google's safety filter. Please modify your prompt and try again.";
        messageType = 'warning';
    } else if (message) {
         // Fallback to the error message if it's not one of the known types
         errorMessage = (err as Error).message;
    }
    
    setStatusMessage({ text: errorMessage, type: messageType });
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) { setStatusMessage({text: "Please enter a prompt.", type: 'error' }); return; }

    setIsLoading(true); setStatusMessage(null); setSafetyCheckResult(null);
    try {
      const generatedDataUrls = await geminiService.generateImagesFromPrompt(prompt, config, uploadedImage, customStyles);
      const newEntries: GenerationHistoryEntry[] = generatedDataUrls.map(url => ({ 
          id: crypto.randomUUID(), 
          imageDataUrl: url, 
          prompt, 
          config: {...config}, 
          uploadedImage,
          timestamp: Date.now()
      }));
      await dbService.addMultipleHistoryEntries(newEntries);
      setHistory(prev => [...newEntries, ...prev].slice(0, MAX_HISTORY_SIZE));
    } catch (err) {
      handleApiError(err);
    } finally { setIsLoading(false); }
  }, [prompt, config, uploadedImage, customStyles]);

  const handlePrimarySubmit = useCallback(() => {
    if (config.model === 'comfyui-local') {
      // In-app generation for ComfyUI is disabled.
      // This function should not be called if the button is correctly disabled.
      // This is a safeguard.
      setStatusMessage({ text: 'Queueing is disabled for ComfyUI. Please use the full interface.', type: 'warning' });
      return;
    }
    handleGenerate();
  }, [config.model, handleGenerate]);
  
  const handleQueueComfyInBackground = async () => {
    setStatusMessage({ text: 'Queueing prompt in ComfyUI...', type: 'info' });
    try {
        const workflowPreset = comfyUiWorkflows.find(w => w.id === config.selectedComfyUiWorkflowId);
        if (!workflowPreset) {
            throw new Error("Selected workflow not found.");
        }
        if (!config.selectedComfyUiCheckpoint) {
            throw new Error("Please select a ComfyUI checkpoint model first.");
        }

        const comfyPrompt = getComfyPrompt(prompt, config, customStyles);

        await comfyuiService.queuePromptInBackground(
            comfyUiServerAddress,
            workflowPreset.workflowJson,
            comfyPrompt,
            config.negativePrompt,
            config.selectedComfyUiCheckpoint,
            config.batchSize,
            config.width ?? 1024,
            config.height ?? 1024,
            config.comfyUiSeed,
            config.loras,
            config.cfg
        );

        setStatusMessage({ text: '✅ Prompt successfully queued in ComfyUI. Generation is running in the background.', type: 'success' });
        
        // Update seed based on control setting AFTER successful queue
        setConfig(c => {
            switch(c.comfyUiSeedControl) {
                case 'increment':
                    return { ...c, comfyUiSeed: c.comfyUiSeed + 1 };
                case 'decrement':
                    return { ...c, comfyUiSeed: c.comfyUiSeed - 1 };
                case 'randomize':
                    return { ...c, comfyUiSeed: Math.floor(Math.random() * 1e15) };
                case 'fixed':
                default:
                    return c;
            }
        });

    } catch (e) {
        setStatusMessage({ text: e instanceof Error ? e.message : 'Failed to queue prompt.', type: 'error' });
    }
  };

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true); setStatusMessage(null);
    try {
      const enhancedPrompt = await geminiService.enhancePromptWithGemini(prompt);
      setPrompt(enhancedPrompt);
    } catch (err) { 
      handleApiError(err);
    } finally { setIsEnhancing(false); }
  }, [prompt]);

  const handleSuggestNegativePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsSuggestingNegative(true);
    setStatusMessage({ text: 'Generating negative prompt suggestions...', type: 'info' });
    try {
      const suggestion = await geminiService.suggestNegativePrompt(prompt);
      setConfig(prevConfig => {
        // Create a set of existing tags for easy de-duplication
        const existingTags = new Set(prevConfig.negativePrompt.split(',').map(t => t.trim()).filter(Boolean));
        
        // Add new suggested tags to the set
        const suggestedTags = suggestion.split(',').map(t => t.trim()).filter(Boolean);
        suggestedTags.forEach(tag => existingTags.add(tag));
        
        // Convert back to a string
        const newNegativePrompt = Array.from(existingTags).join(', ');
        
        return { ...prevConfig, negativePrompt: newNegativePrompt };
      });
      setStatusMessage({ text: 'Negative prompt updated with suggestions.', type: 'success' });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSuggestingNegative(false);
    }
  }, [prompt, setConfig]);

  const handleCheckPromptSafety = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsCheckingSafety(true); setStatusMessage(null);
    try {
        setSafetyCheckResult(await geminiService.checkPromptSafety(prompt));
    } catch (err) { 
        handleApiError(err);
    } finally { setIsCheckingSafety(false); }
  }, [prompt]);

  const handlePostProcess = useCallback(async (id: string, imageUrl: string, processPrompt: string) => {
    setProcessingIndex(id);
    setStatusMessage(null);
    try {
        const newImage = await geminiService.postProcessImage(imageUrl, processPrompt);
        const newEntry: GenerationHistoryEntry = {
            id: crypto.randomUUID(),
            imageDataUrl: newImage,
            prompt: `Post-processed: ${processPrompt}`,
            config,
            uploadedImage: { data: imageUrl, mimeType: 'image/png' },
            timestamp: Date.now(),
        };
        await dbService.addHistoryEntry(newEntry);
        setHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY_SIZE));
    } catch (err) {
        handleApiError(err);
    } finally {
        setProcessingIndex(null);
    }
}, [config]);

  const handleMagicEdit = useCallback(async (editPrompt: string) => {
    if (!magicEditState.imageData || !magicEditState.imageId) {
        setStatusMessage({ text: "An error occurred with Magic Edit.", type: 'error' });
        return;
    }
    setMagicEditState(prev => ({ ...prev, isLoading: true }));
    setStatusMessage(null);
    try {
        const newImage = await geminiService.postProcessImage(magicEditState.imageData, editPrompt);
        const newEntry: GenerationHistoryEntry = {
            id: crypto.randomUUID(),
            imageDataUrl: newImage,
            prompt: `Magic Edit: "${editPrompt}"`,
            config: { ...config, model: 'gemini-2.5-flash-image-preview' }, // Magic edit always uses Gemini
            uploadedImage: { data: magicEditState.imageData, mimeType: 'image/png' },
            timestamp: Date.now(),
        };
        await dbService.addHistoryEntry(newEntry);
        setHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY_SIZE));
        setMagicEditState({ isOpen: false, imageId: null, imageData: null, isLoading: false });
    } catch (err) {
        handleApiError(err);
    } finally {
        setMagicEditState(prev => ({ ...prev, isLoading: false }));
    }
  }, [config, magicEditState.imageData, magicEditState.imageId]);

  const handleSyncComfyImages = async (options?: { closeModal?: boolean }) => {
    try {
      const syncedImages = await comfyuiService.fetchRecentImages(comfyUiServerAddress);
      if (syncedImages.length === 0) {
        setStatusMessage({ text: 'No new images found in ComfyUI history.', type: 'info' });
        return;
      }

      const newHistoryEntries: GenerationHistoryEntry[] = syncedImages.map(img => ({
          id: crypto.randomUUID(),
          imageDataUrl: img.imageDataUrl,
          prompt: img.prompt,
          config: { ...config, model: 'comfyui-local' }, // Assume comfy model
          uploadedImage: null,
          timestamp: Date.now(),
          comfyUiWorkflow: img.workflowJson,
          comfyUiFilename: img.filename,
      }));

      // Deduplicate before adding
      const existingFilenames = new Set(history.map(h => h.comfyUiFilename).filter(Boolean));
      const entriesToAdd = newHistoryEntries.filter(e => !existingFilenames.has(e.comfyUiFilename));

      if (entriesToAdd.length > 0) {
          await dbService.addMultipleHistoryEntries(entriesToAdd);
          setHistory(prev => [...entriesToAdd, ...prev].slice(0, MAX_HISTORY_SIZE));
          setStatusMessage({ text: `Synced ${entriesToAdd.length} new image(s) from ComfyUI.`, type: 'success' });
      } else {
           setStatusMessage({ text: 'All recent ComfyUI images are already in your history.', type: 'info' });
      }

      if (options?.closeModal) {
          setIsComfyEmbedOpen(false);
      }

    } catch (err) {
      handleApiError(err);
    }
  };

  const handleSendToComfyCanvas = async (id: string, imageUrl: string) => {
      setSendingToComfyId(id);
      try {
          const nodeData = await comfyuiService.uploadAndPrepareNodeData(comfyUiServerAddress, imageUrl);
          setNodeToCopy(nodeData);
          setIsComfyEmbedOpen(true);
      } catch (err) {
          setStatusMessage({ text: err instanceof Error ? err.message : 'Failed to send image.', type: 'error' });
      } finally {
          setSendingToComfyId(null);
      }
  };

  const handleImageAction = (action: (imageUrl: string, prompt: string) => Promise<string>, prompt: string) => 
    (id: string, imageUrl: string) => {
        setProcessingIndex(id);
        setStatusMessage(null);
        action(imageUrl, prompt)
            .then(newImage => {
                const newEntry: GenerationHistoryEntry = {
                    id: crypto.randomUUID(),
                    imageDataUrl: newImage,
                    prompt: `${prompt.split(' ')[0]}: ${history.find(h => h.id === id)?.prompt || ''}`,
                    config,
                    uploadedImage: { data: imageUrl, mimeType: 'image/png' },
                    timestamp: Date.now()
                };
                 dbService.addHistoryEntry(newEntry);
                setHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY_SIZE));
            })
            .catch(err => handleApiError(err))
            .finally(() => setProcessingIndex(null));
    };

  const handleEnhanceImage = handleImageAction(geminiService.postProcessImage, geminiService.ENHANCE_PROMPT);
  const handleFixFace = handleImageAction(geminiService.postProcessImage, geminiService.FACE_FIX_PROMPT);
  const handleUpscale = handleImageAction(geminiService.postProcessImage, geminiService.UPSCALE_PROMPT);
  const handleRemoveWatermark = handleImageAction(geminiService.postProcessImage, geminiService.REMOVE_WATERMARK_PROMPT);
  
  const handleCopyImage = async (imageDataUrl: string) => {
      try {
          const blob = await (await fetch(imageDataUrl)).blob();
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setStatusMessage({ text: 'Image copied to clipboard!', type: 'success' });
      } catch (err) {
          setStatusMessage({ text: 'Failed to copy image.', type: 'error' });
      }
  };
  
  const handleDownloadImage = (imageDataUrl: string) => {
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleShareRecipe = async (entry: GenerationHistoryEntry) => {
    const recipe: GenerationRecipe = {
        id: crypto.randomUUID(),
        name: `Recipe from ${new Date(entry.timestamp).toLocaleString()}`,
        prompt: entry.prompt,
        config: entry.config,
    };
    try {
        await navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
        setStatusMessage({ text: 'Generation recipe copied to clipboard!', type: 'success' });
    } catch (err) {
        setStatusMessage({ text: 'Failed to copy recipe.', type: 'error' });
    }
  };
  
  const handleLoadRecipe = (recipe: GenerationRecipe) => {
    setPrompt(recipe.prompt);
    setConfig(recipe.config);
    setStatusMessage({text: `Loaded recipe: "${recipe.name}"`, type: 'info'});
    setIsRecipeManagerOpen(false);
  }
  
  const handleSaveRecipe = (name: string) => {
    const newRecipe: GenerationRecipe = {
        id: crypto.randomUUID(),
        name,
        prompt,
        config,
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const handleLoadHistory = (entry: GenerationHistoryEntry) => {
      setPrompt(entry.prompt);
      setConfig(entry.config);
      if(entry.uploadedImage) {
        setUploadedImage(entry.uploadedImage);
      } else {
        setUploadedImage(null);
      }
      setIsHistoryOpen(false);
  }

  const handleDeleteHistory = async (id: string) => {
      await dbService.deleteHistoryEntry(id);
      setHistory(prev => prev.filter(entry => entry.id !== id));
  }
  
  const handleResetTags = () => {
    if (window.confirm("Are you sure you want to reset all tags to their initial state? This cannot be undone.")) {
        setManagedTags(initialManagedTags);
        setStatusMessage({text: "Tag library has been reset to defaults.", type: 'info'});
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-text-primary">
        {visibleRatGifs.map(id => {
            const gif = ratGifs.find(g => g.id === id);
            if (!gif) return null;
            
            const classMap: Record<string, string> = {
                'bottom-right-stack-1': 'fixed bottom-4 right-4 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-right-stack-2': 'fixed bottom-4 right-20 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-right-stack-3': 'fixed bottom-20 right-4 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-right-stack-4': 'fixed bottom-20 right-20 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-left-stack-1': 'fixed bottom-4 left-4 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-left-stack-2': 'fixed bottom-4 left-20 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-left-stack-3': 'fixed bottom-20 left-4 h-24 w-24 z-50 pointer-events-none rounded-full',
                'bottom-left-stack-4': 'fixed bottom-20 left-20 h-24 w-24 z-50 pointer-events-none rounded-full',
            };
            
            const finalClassName = gif.className || classMap[gif.position] || '';

            return <img key={gif.id} src={gif.src} alt={gif.alt} className={finalClassName} />;
        })}
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        customThemes={customThemes}
        onOpenThemeEditor={() => setIsThemeEditorOpen(true)}
        onHeaderClick={handleHeaderClick}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />
      <main ref={mainRef} className="container mx-auto p-4 md:p-8 flex-grow space-y-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {statusMessage && <StatusMessage message={statusMessage} />}
          <ImagePromptForm
            prompt={prompt} setPrompt={setPrompt}
            config={config} setConfig={setConfig}
            onSubmit={handlePrimarySubmit}
            isLoading={isLoading}
            onOpenStyleManager={() => setIsStyleManagerOpen(true)}
            onOpenRecipeManager={() => setIsRecipeManagerOpen(true)}
            savedPresets={savedPresets}
            customStyles={customStyles}
            onApplyPreset={(styles: string[]) => setConfig(prev => ({ ...prev, styles }))}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            onEnhancePrompt={handleEnhancePrompt}
            isEnhancing={isEnhancing}
            onSuggestNegativePrompt={handleSuggestNegativePrompt}
            isSuggestingNegative={isSuggestingNegative}
            // FIX: Corrected typo from handleCheckSafety to handleCheckPromptSafety
            onCheckSafety={handleCheckPromptSafety}
            isCheckingSafety={isCheckingSafety}
            safetyCheckResult={safetyCheckResult}
            setSafetyCheckResult={setSafetyCheckResult}
            comfyUiServerAddress={comfyUiServerAddress}
            setComfyUiServerAddress={setComfyUiServerAddress}
            onOpenComfyGuide={() => setIsComfyGuideOpen(true)}
            onOpenComfyUIEmbed={() => setIsComfyEmbedOpen(true)}
            onSyncComfyImages={handleSyncComfyImages}
            onQueueComfyInBackground={handleQueueComfyInBackground}
            comfyUiStatus={comfyUiStatus}
            onCheckComfyConnection={checkComfyConnection}
            comfyUiWorkflows={comfyUiWorkflows}
            selectedComfyUiWorkflowId={config.selectedComfyUiWorkflowId || ''}
            setSelectedComfyUiWorkflowId={(id) => setConfig(prev => ({ ...prev, selectedComfyUiWorkflowId: id }))}
            onOpenWorkflowManager={() => setIsWorkflowManagerOpen(true)}
            comfyUiCheckpoints={comfyUiCheckpoints}
            comfyUiLoras={comfyUiLoras}
            selectedComfyUiCheckpoint={config.selectedComfyUiCheckpoint || ''}
            setSelectedComfyUiCheckpoint={(val) => setConfig(prev => ({...prev, selectedComfyUiCheckpoint: val}))}
            managedTags={managedTags}
            onOpenTagManager={() => setIsTagManagerOpen(true)}
            onOpenNegativeGuide={() => setIsNegativeGuideOpen(true)}
            onOpenCheckpointManager={() => setIsCheckpointManagerOpen(true)}
            hiddenCheckpoints={hiddenCheckpoints}
          />
        </div>
        <div className="max-w-7xl mx-auto">
          <ImageDisplay
            images={history}
            isLoading={isLoading}
            config={config}
            onSelectCheckpointRequest={() => mainRef.current?.querySelector<HTMLElement>('#comfy-checkpoint')?.focus()}
            processingIndex={processingIndex}
            sendingToComfyId={sendingToComfyId}
            onDownload={handleDownloadImage}
            onCopyImage={handleCopyImage}
            onUseAsInput={(data) => setUploadedImage({ data, mimeType: 'image/png' })}
            onSendToComfyCanvas={handleSendToComfyCanvas}
            onEnhance={handleEnhanceImage}
            onFixFace={handleFixFace}
            onUpscale={handleUpscale}
            onRemoveWatermark={handleRemoveWatermark}
            onMagicEdit={(id, data) => setMagicEditState({ isOpen: true, imageId: id, imageData: data, isLoading: false })}
            onShare={handleShareRecipe}
            onDelete={handleDeleteHistory}
            onViewWorkflow={(json) => setWorkflowToPreview(json)}
            onRemix={handleLoadHistory}
          />
        </div>
      </main>
      <Footer />

      {/* --- Modals --- */}
      <StyleManager
        isOpen={isStyleManagerOpen}
        onClose={() => setIsStyleManagerOpen(false)}
        savedPresets={savedPresets}
        customStyles={customStyles}
        currentStyles={config.styles}
        onSavePreset={(name) => setSavedPresets(prev => [...prev, { id: crypto.randomUUID(), name, styles: config.styles }])}
        onDeletePreset={(id) => setSavedPresets(prev => prev.filter(p => p.id !== id))}
        onSaveCustomStyle={(name, prompt) => setCustomStyles(prev => [...prev, { id: crypto.randomUUID(), name, prompt }])}
        onDeleteCustomStyle={(id) => setCustomStyles(prev => prev.filter(cs => cs.id !== id))}
        onApplyPreset={(styles) => { setConfig(prev => ({ ...prev, styles })); setIsStyleManagerOpen(false); }}
      />
      <RecipeManagerModal
        isOpen={isRecipeManagerOpen}
        onClose={() => setIsRecipeManagerOpen(false)}
        recipes={recipes}
        onSave={handleSaveRecipe}
        onDelete={(id) => setRecipes(prev => prev.filter(r => r.id !== id))}
        onLoad={handleLoadRecipe}
        onSetDefault={setDefaultRecipeId}
        defaultRecipeId={defaultRecipeId}
        currentPrompt={prompt}
       />
      <MagicEditModal
        isOpen={magicEditState.isOpen}
        isLoading={magicEditState.isLoading}
        imageData={magicEditState.imageData}
        onClose={() => setMagicEditState({ isOpen: false, imageId: null, imageData: null, isLoading: false })}
        onSubmit={handleMagicEdit}
      />
       <ThemeEditor
          isOpen={isThemeEditorOpen}
          onClose={() => { setIsThemeEditorOpen(false); setPreviewTheme(null); }}
          customThemes={customThemes}
          onSaveTheme={(theme) => {
              setCustomThemes(prev => {
                  const existing = prev.find(t => t.id === theme.id);
                  if (existing) {
                      return prev.map(t => t.id === theme.id ? theme : t);
                  }
                  return [...prev, theme];
              });
              setTheme(theme.id);
          }}
          onDeleteTheme={(id) => {
              if (theme === id) setTheme('dark');
              setCustomThemes(prev => prev.filter(t => t.id !== id));
          }}
          onSelectTheme={setTheme}
          activeThemeId={theme}
          onPreviewTheme={setPreviewTheme}
      />
      <ComfyUIGuideModal isOpen={isComfyGuideOpen} onClose={() => setIsComfyGuideOpen(false)} />
      <ComfyUIWorkflowManager 
        isOpen={isWorkflowManagerOpen}
        onClose={() => setIsWorkflowManagerOpen(false)}
        workflows={comfyUiWorkflows}
        onSave={(wf) => {
            setComfyUiWorkflows(prev => {
                const existing = prev.find(w => w.id === wf.id);
                if (existing) {
                    return prev.map(w => w.id === wf.id ? wf : w);
                }
                return [...prev, wf];
            });
        }}
        onDelete={(id) => {
            if(config.selectedComfyUiWorkflowId === id) {
              setConfig(prev => ({...prev, selectedComfyUiWorkflowId: 'default-t2i-simple'}));
            }
            setComfyUiWorkflows(prev => prev.filter(w => w.id !== id))
        }}
      />
      <ComfyUIEmbedModal 
        isOpen={isComfyEmbedOpen}
        onClose={() => setIsComfyEmbedOpen(false)}
        serverAddress={comfyUiServerAddress}
        onSyncImages={handleSyncComfyImages}
        nodeToCopy={nodeToCopy}
        onCopyComplete={() => setNodeToCopy(null)}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={handleLoadHistory}
        onDelete={handleDeleteHistory}
        onShare={handleShareRecipe}
       />
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={managedTags}
        onUpdateTags={setManagedTags}
        onResetToDefaults={handleResetTags}
      />
      <NegativePromptGuideModal isOpen={isNegativeGuideOpen} onClose={() => setIsNegativeGuideOpen(false)} />
      <CheckpointManagerModal
        isOpen={isCheckpointManagerOpen}
        onClose={() => setIsCheckpointManagerOpen(false)}
        allCheckpoints={comfyUiCheckpoints}
        hiddenCheckpoints={hiddenCheckpoints}
        onUpdateHiddenCheckpoints={setHiddenCheckpoints}
      />
      <WorkflowPreviewModal 
        isOpen={!!workflowToPreview}
        onClose={() => setWorkflowToPreview(null)}
        workflowJson={workflowToPreview}
      />
    </div>
  );
};

export default App;