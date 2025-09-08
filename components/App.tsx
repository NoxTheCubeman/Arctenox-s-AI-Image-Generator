import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageConfig, SavedStylePreset, CustomStylePreset, SafetyCheckResult, CustomTheme, StatusMessage as StatusMessageProps, ComfyUIWorkflowPreset, GenerationHistoryEntry } from '../types';
import { generateImagesFromPrompt, postProcessImage, ENHANCE_PROMPT, FACE_FIX_PROMPT, UPSCALE_PROMPT, REMOVE_WATERMARK_PROMPT, enhancePromptWithGemini, checkPromptSafety } from '../services/geminiService';
import * as comfyuiService from '../services/comfyuiService';
import Header from './Header';
import ImagePromptForm from './ImagePromptForm';
import ImageDisplay from './ImageDisplay';
import StatusMessage from './ErrorMessage';
import Footer from './Footer';
import useLocalStorage from '../hooks/useLocalStorage';
import StyleManager from './StyleManager';
import MagicEditModal from './MagicEditModal';
import { themes } from '../lib/themes';
import ThemeEditor from './ThemeEditor';
import ComfyUIGuideModal from './ComfyUIGuideModal';
import { getComfyPrompt } from '../lib/promptBuilder';
import ComfyUIWorkflowManager from './ComfyUIWorkflowManager';
import ComfyUIEmbedModal from './ComfyUIEmbedModal';
import HistoryModal from './HistoryModal';

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
    selectedComfyUiWorkflowId: 'default-t2i',
    selectedComfyUiCheckpoint: ''
  });
  const [history, setHistory] = useLocalStorage<GenerationHistoryEntry[]>('generation-history', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessageProps | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [isCheckingSafety, setIsCheckingSafety] = useState<boolean>(false);
  const [safetyCheckResult, setSafetyCheckResult] = useState<SafetyCheckResult | null>(null);
  
  // ComfyUI State
  const [comfyUiServerAddress, setComfyUiServerAddress] = useLocalStorage<string>('comfy-address', 'http://127.0.0.1:8188');
  const [isComfyGuideOpen, setIsComfyGuideOpen] = useState(false);
  const [comfyUiStatus, setComfyUiStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [comfyUiWorkflows, setComfyUiWorkflows] = useLocalStorage<ComfyUIWorkflowPreset[]>('comfy-workflows', [
    { id: 'default-t2i', name: 'Default Text-to-Image', workflowJson: comfyuiService.DEFAULT_T2I_WORKFLOW_API },
    { id: 'default-i2i', name: 'Default Image-to-Image', workflowJson: comfyuiService.DEFAULT_I2I_WORKFLOW_API },
  ]);
  const [isWorkflowManagerOpen, setIsWorkflowManagerOpen] = useState(false);
  const [comfyUiCheckpoints, setComfyUiCheckpoints] = useState<string[]>([]);
  const [comfyUiProgress, setComfyUiProgress] = useState<{ value: number; max: number } | null>(null);
  const [comfyUiInputImage, setComfyUiInputImage] = useState<string | null>(null);
  const [isComfyEmbedOpen, setIsComfyEmbedOpen] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [magicEditState, setMagicEditState] = useState<{ isOpen: boolean; imageIndex: number | null; imageData: string | null; isLoading: boolean }>({
    isOpen: false,
    imageIndex: null,
    imageData: null,
    isLoading: false,
  });

  const mainRef = useRef<HTMLElement>(null);

  const [savedPresets, setSavedPresets] = useLocalStorage<SavedStylePreset[]>('style-presets', []);
  const [customStyles, setCustomStyles] = useLocalStorage<CustomStylePreset[]>('custom-styles', []);
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);

  const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('custom-themes', []);
  const [theme, setTheme] = useLocalStorage<string>('app-theme', 'rat');
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Partial<CustomTheme> | null>(null);
  
  const [ratClickCount, setRatClickCount] = useState(0);
  const [visibleRatGifs, setVisibleRatGifs] = useState<string[]>([]);
  const [resetTargetClicks, setResetTargetClicks] = useState<number | null>(null);
  const [resetCurrentClicks, setResetCurrentClicks] = useState(0);

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
      if (checkpoints.length > 0 && (!config.selectedComfyUiCheckpoint || !checkpoints.includes(config.selectedComfyUiCheckpoint))) {
        setConfig(c => ({...c, selectedComfyUiCheckpoint: checkpoints[0]}));
      }
    } catch (e) {
      setComfyUiStatus('offline');
      setComfyUiCheckpoints([]);
      setStatusMessage({ text: 'Could not connect to ComfyUI server. Ensure it is running with --enable-cors argument.', type: 'error' });
    }
  }, [comfyUiServerAddress, config.selectedComfyUiCheckpoint]);

  useEffect(() => {
    if (config.model === 'comfyui-local' && comfyUiStatus === 'idle') {
      checkComfyConnection();
    }
  }, [config.model, comfyUiStatus, checkComfyConnection]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    let themeToApply: { colors: { [key: string]: string }, backgroundImage?: string, uiOpacity?: number };

    if (previewTheme) {
        themeToApply = {
            colors: previewTheme.colors || themes.dark,
            backgroundImage: previewTheme.backgroundImage,
            uiOpacity: previewTheme.uiOpacity,
        };
    } else {
        const activeBuiltInTheme = themes[theme];
        const activeCustomTheme = customThemes.find(t => t.id === theme);
        if (activeBuiltInTheme) {
            themeToApply = { colors: activeBuiltInTheme, uiOpacity: 1, backgroundImage: '' };
        } else if (activeCustomTheme) {
            themeToApply = {
                colors: activeCustomTheme.colors,
                backgroundImage: activeCustomTheme.backgroundImage || '',
                uiOpacity: activeCustomTheme.uiOpacity ?? 1,
            };
        } else { 
            themeToApply = { colors: themes.dark, uiOpacity: 1, backgroundImage: '' };
            setTheme('dark'); 
        }
    }

    Object.entries(themeToApply.colors).forEach(([key, value]) => root.style.setProperty(key, value));
    body.style.backgroundImage = themeToApply.backgroundImage ? `url(${themeToApply.backgroundImage})` : '';
    body.style.backgroundSize = 'cover'; body.style.backgroundPosition = 'center'; body.style.backgroundAttachment = 'fixed';
    root.style.setProperty('--ui-opacity', String(themeToApply.uiOpacity ?? 1));
  }, [theme, customThemes, setTheme, previewTheme]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) { setStatusMessage({text: "Please enter a prompt.", type: 'error' }); return; }
    if (config.model === 'comfyui-local') { return; /* Disabled */ }
    setIsLoading(true); setStatusMessage(null); setSafetyCheckResult(null);
    try {
      const generatedDataUrls = await generateImagesFromPrompt(prompt, config, uploadedImage, customStyles);
      const newEntries = generatedDataUrls.map(url => ({ id: crypto.randomUUID(), imageDataUrl: url, prompt, config: {...config}, uploadedImage, comfyUiInputImage: null }));
      setHistory(prev => [...newEntries, ...prev]);
    } catch (err) {
      setStatusMessage({ text: err instanceof Error ? err.message : 'An unknown error occurred.', type: 'error' });
    } finally { setIsLoading(false); }
  }, [prompt, config, uploadedImage, customStyles, setHistory]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true); setStatusMessage(null);
    try {
      const enhancedPrompt = await enhancePromptWithGemini(prompt);
      setPrompt(enhancedPrompt);
    } catch (err) { setStatusMessage({ text: err instanceof Error ? err.message : String(err), type: 'error' });
    } finally { setIsEnhancing(false); }
  }, [prompt]);

  const handleCheckPromptSafety = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsCheckingSafety(true); setStatusMessage(null);
    try {
        setSafetyCheckResult(await checkPromptSafety(prompt));
    } catch (err) { setStatusMessage({ text: err instanceof Error ? err.message : String(err), type: 'error' });
    } finally { setIsCheckingSafety(false); }
  }, [prompt]);

  const handlePostProcess = useCallback(async (index: number, processPrompt: string) => {
    setProcessingIndex(index); setStatusMessage(null);
    try {
        const imageToProcess = history[index];
        const newImage = await postProcessImage(imageToProcess.imageDataUrl, processPrompt);
        const newEntry = { ...imageToProcess, id: crypto.randomUUID(), imageDataUrl: newImage, prompt: `Post-process: ${processPrompt}` };
        const updatedHistory = history.map((item, i) => i === index ? newEntry : item);
        setHistory(updatedHistory);
    } catch (err) { setStatusMessage({ text: err instanceof Error ? err.message : String(err), type: 'error' });
    } finally { setProcessingIndex(null); }
  }, [history, setHistory]);
  
  const handleMagicEditSubmit = async (editPrompt: string) => {
    if (!editPrompt || magicEditState.imageIndex === null) return;
    setMagicEditState(prev => ({ ...prev, isLoading: true })); setStatusMessage(null);
    try {
      const imageToProcess = history[magicEditState.imageIndex];
      const newImage = await postProcessImage(imageToProcess.imageDataUrl, editPrompt);
      const newEntry = { ...imageToProcess, id: crypto.randomUUID(), imageDataUrl: newImage, prompt: `Magic Edit: ${editPrompt}` };
      const updatedHistory = history.map((item, i) => i === magicEditState.imageIndex ? newEntry : item);
      setHistory(updatedHistory);
      setMagicEditState({ isOpen: false, imageIndex: null, imageData: null, isLoading: false });
    } catch (err) {
      setStatusMessage({ text: err instanceof Error ? err.message : String(err), type: 'error' });
      setMagicEditState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleEnhanceImage = (index: number) => handlePostProcess(index, ENHANCE_PROMPT);
  const handleFixFace = (index: number) => handlePostProcess(index, FACE_FIX_PROMPT);
  const handleUpscaleImage = (index: number) => handlePostProcess(index, UPSCALE_PROMPT);
  const handleRemoveWatermark = (index: number) => handlePostProcess(index, REMOVE_WATERMARK_PROMPT);
  const handleOpenMagicEdit = (index: number) => {
    setMagicEditState({
      isOpen: true,
      imageIndex: index,
      imageData: history[index].imageDataUrl,
      isLoading: false,
    });
  };

  const handleDownloadImage = (imageDataUrl: string) => {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUseAsInput = async (imageData: string) => {
    try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        setUploadedImage({
            data: imageData,
            mimeType: blob.type
        });
        setStatusMessage({ text: 'Image set as Img2Img input.', type: 'info' });
        mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        setStatusMessage({ text: 'Failed to use image as input.', type: 'error' });
    }
  };
  
  const handleSetComfyInputImage = useCallback((imageData: string) => {
    setComfyUiInputImage(imageData);
    setConfig(c => ({...c, model: 'comfyui-local'}));
    setStatusMessage({text: 'Image set as ComfyUI input.', type: 'info'});
    mainRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);
  
  const handleLoadFromHistory = (entry: GenerationHistoryEntry) => {
    setPrompt(entry.prompt);
    setConfig(entry.config);
    setUploadedImage(entry.uploadedImage);
    setComfyUiInputImage(entry.comfyUiInputImage);
    setIsHistoryOpen(false);
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDeleteFromHistory = (id: string) => setHistory(prev => prev.filter(entry => entry.id !== id));
  
  const handleShare = (entry: GenerationHistoryEntry) => {
      const recipe = { prompt: entry.prompt, config: entry.config };
      navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
      setStatusMessage({ text: 'Generation recipe copied to clipboard!', type: 'success' });
  };
  
  const handleSavePreset = (name: string) => {
    const newPreset: SavedStylePreset = { id: crypto.randomUUID(), name, styles: config.styles };
    setSavedPresets(prev => [...prev, newPreset]);
  };
  const handleDeletePreset = (id: string) => {
    setSavedPresets(prev => prev.filter(p => p.id !== id));
  };
  const handleSaveCustomStyle = (name: string, prompt: string) => {
    const newStyle: CustomStylePreset = { id: crypto.randomUUID(), name, prompt };
    setCustomStyles(prev => [...prev, newStyle]);
  };
  const handleDeleteCustomStyle = (id: string) => {
    setCustomStyles(prev => prev.filter(s => s.id !== id));
    setConfig(prev => ({ ...prev, styles: prev.styles.filter(s => s !== id) }));
  };
  const handleApplyPreset = (styles: string[]) => setConfig(prev => ({ ...prev, styles }));

  const handleSaveCustomTheme = (themeToSave: CustomTheme) => {
    setCustomThemes(prev => {
        const existing = prev.find(t => t.id === themeToSave.id);
        if (existing) {
            return prev.map(t => (t.id === themeToSave.id ? themeToSave : t));
        }
        return [...prev, themeToSave];
    });
  };
  const handleDeleteCustomTheme = (id: string) => {
    if (theme === id) {
        setTheme('rat'); // Fallback to default
    }
    setCustomThemes(prev => prev.filter(t => t.id !== id));
  };
  const handleSaveWorkflow = (workflow: ComfyUIWorkflowPreset) => {
    setComfyUiWorkflows(prev => {
        const existingIndex = prev.findIndex(w => w.id === workflow.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = workflow;
            return updated;
        }
        return [...prev, workflow];
    });
  };
  const handleDeleteWorkflow = (id: string) => {
    setComfyUiWorkflows(prev => prev.filter(w => w.id !== id));
    if (config.selectedComfyUiWorkflowId === id) {
      setConfig(prevConfig => ({...prevConfig, selectedComfyUiWorkflowId: 'default-t2i'}));
    }
  };
  const handleFetchLatestComfyImage = async () => {
    setStatusMessage({ text: 'Fetching latest image from ComfyUI...', type: 'info' });
    try {
        const imageDataUrl = await comfyuiService.fetchLatestImage(comfyUiServerAddress);
        const newEntry: GenerationHistoryEntry = {
            id: crypto.randomUUID(),
            imageDataUrl,
            prompt: 'Fetched from ComfyUI',
            config,
            uploadedImage: null,
            comfyUiInputImage: null,
        };
        setHistory(prev => [newEntry, ...prev]);
        setStatusMessage({ text: 'Successfully fetched latest image.', type: 'success' });
        setIsComfyEmbedOpen(false);
    } catch (e) {
        setStatusMessage({ text: e instanceof Error ? e.message : 'Failed to fetch image.', type: 'error' });
    }
  };
  const setSelectedComfyUiWorkflowId = (id: string) => {
    setConfig(prev => ({...prev, selectedComfyUiWorkflowId: id}));
  };
  const setSelectedComfyUiCheckpoint = (checkpoint: string) => {
    setConfig(prev => ({...prev, selectedComfyUiCheckpoint: checkpoint}));
  };

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col">
      <div className="fixed inset-0 bg-bg-primary -z-10"></div>
      <Header onOpenHistory={() => setIsHistoryOpen(true)} theme={theme} setTheme={setTheme} onOpenThemeEditor={() => setIsThemeEditorOpen(true)} customThemes={customThemes} onHeaderClick={handleHeaderClick} />
      <main ref={mainRef} className="container mx-auto p-4 md:p-6 flex-grow">
        <div className="max-w-4xl mx-auto space-y-6">
          <ImagePromptForm 
            prompt={prompt}
            setPrompt={setPrompt}
            config={config}
            setConfig={setConfig}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            onOpenStyleManager={() => setIsStyleManagerOpen(true)}
            savedPresets={savedPresets}
            customStyles={customStyles}
            onApplyPreset={handleApplyPreset}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            onEnhancePrompt={handleEnhancePrompt}
            isEnhancing={isEnhancing}
            onCheckSafety={handleCheckPromptSafety}
            isCheckingSafety={isCheckingSafety}
            safetyCheckResult={safetyCheckResult}
            setSafetyCheckResult={setSafetyCheckResult}
            comfyUiServerAddress={comfyUiServerAddress}
            setComfyUiServerAddress={setComfyUiServerAddress}
            onOpenComfyGuide={() => setIsComfyGuideOpen(true)}
            onOpenComfyUIEmbed={() => setIsComfyEmbedOpen(true)}
            comfyUiStatus={comfyUiStatus}
            onCheckComfyConnection={checkComfyConnection}
            comfyUiWorkflows={comfyUiWorkflows}
            selectedComfyUiWorkflowId={config.selectedComfyUiWorkflowId}
            setSelectedComfyUiWorkflowId={setSelectedComfyUiWorkflowId}
            onOpenWorkflowManager={() => setIsWorkflowManagerOpen(true)}
            comfyUiCheckpoints={comfyUiCheckpoints}
            selectedComfyUiCheckpoint={config.selectedComfyUiCheckpoint}
            setSelectedComfyUiCheckpoint={setSelectedComfyUiCheckpoint}
            comfyUiInputImage={comfyUiInputImage}
            setComfyUiInputImage={setComfyUiInputImage}
          />
          {statusMessage && <StatusMessage message={statusMessage} />}
          <div className="mt-6">
            <ImageDisplay 
                images={history}
                isLoading={isLoading}
                isComfyUiMode={config.model === 'comfyui-local'}
                comfyUiProgress={comfyUiProgress}
                processingIndex={processingIndex}
                onDownload={handleDownloadImage}
                onUseAsInput={handleUseAsInput}
                onUseAsComfyInput={handleSetComfyInputImage}
                onEnhance={handleEnhanceImage}
                onFixFace={handleFixFace}
                onUpscale={handleUpscaleImage}
                onRemoveWatermark={handleRemoveWatermark}
                onMagicEdit={handleOpenMagicEdit}
                onShare={handleShare}
             />
          </div>
        </div>
      </main>
      <Footer />
      {(() => {
        const rightStackedGifs = ratGifs
            .filter(gif => visibleRatGifs.includes(gif.id) && gif.position.startsWith('bottom-right-stack'))
            .sort((a, b) => a.position.localeCompare(b.position));
        
        const leftStackedGifs = ratGifs
            .filter(gif => visibleRatGifs.includes(gif.id) && gif.position.startsWith('bottom-left-stack'))
            .sort((a, b) => a.position.localeCompare(b.position));

        const floatingGifs = ratGifs
            .filter(gif => visibleRatGifs.includes(gif.id) && !gif.position.startsWith('bottom-right-stack') && !gif.position.startsWith('bottom-left-stack'));
        
        return (
          <>
            {rightStackedGifs.length > 0 && (
              <div className="fixed bottom-4 right-4 z-50 pointer-events-none flex flex-col-reverse gap-2">
                {rightStackedGifs.map(gif => (
                  <div
                      key={gif.id}
                      className="w-48 h-48 rounded-lg shadow-lg bg-cover bg-center border-2 border-accent"
                      style={{ backgroundImage: `url(${gif.src})` }}
                      role="img"
                      aria-label={gif.alt}
                  />
                ))}
              </div>
            )}
            {leftStackedGifs.length > 0 && (
              <div className="fixed bottom-4 left-4 z-50 pointer-events-none flex flex-col-reverse gap-2">
                {leftStackedGifs.map(gif => (
                  <div
                      key={gif.id}
                      className="w-48 h-48 rounded-lg shadow-lg bg-cover bg-center border-2 border-accent"
                      style={{ backgroundImage: `url(${gif.src})` }}
                      role="img"
                      aria-label={gif.alt}
                  />
                ))}
              </div>
            )}
            {floatingGifs.map(gif => (
                <img key={gif.id} src={gif.src} alt={gif.alt} className={gif.className} />
            ))}
          </>
        );
      })()}
      
      <StyleManager 
        isOpen={isStyleManagerOpen} 
        onClose={() => setIsStyleManagerOpen(false)}
        savedPresets={savedPresets}
        customStyles={customStyles}
        currentStyles={config.styles}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
        onSaveCustomStyle={handleSaveCustomStyle}
        onDeleteCustomStyle={handleDeleteCustomStyle}
        onApplyPreset={handleApplyPreset}
      />
      <MagicEditModal 
        isOpen={magicEditState.isOpen}
        isLoading={magicEditState.isLoading}
        imageData={magicEditState.imageData}
        onClose={() => setMagicEditState({ isOpen: false, imageIndex: null, imageData: null, isLoading: false })}
        onSubmit={handleMagicEditSubmit}
      />
      <ThemeEditor 
        isOpen={isThemeEditorOpen}
        onClose={() => {
            setIsThemeEditorOpen(false);
            setPreviewTheme(null);
        }}
        customThemes={customThemes}
        onSaveTheme={handleSaveCustomTheme}
        onDeleteTheme={handleDeleteCustomTheme}
        onSelectTheme={setTheme}
        activeThemeId={theme}
        onPreviewTheme={setPreviewTheme}
      />
      <ComfyUIGuideModal isOpen={isComfyGuideOpen} onClose={() => setIsComfyGuideOpen(false)} />
      <ComfyUIWorkflowManager 
        isOpen={isWorkflowManagerOpen} 
        onClose={() => setIsWorkflowManagerOpen(false)}
        workflows={comfyUiWorkflows}
        onSave={handleSaveWorkflow}
        onDelete={handleDeleteWorkflow}
      />
      <ComfyUIEmbedModal 
        isOpen={isComfyEmbedOpen}
        onClose={() => setIsComfyEmbedOpen(false)}
        serverAddress={comfyUiServerAddress}
        onFetchImage={handleFetchLatestComfyImage}
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onLoad={handleLoadFromHistory} onDelete={handleDeleteFromHistory} onShare={handleShare} />
    </div>
  );
};
export default App;