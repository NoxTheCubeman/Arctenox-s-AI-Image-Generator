import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { GenerationHistoryEntry } from '../types';

interface ImageDisplayProps {
  images: GenerationHistoryEntry[];
  isLoading: boolean;
  isComfyUiMode: boolean;
  comfyUiProgress: { value: number; max: number } | null;
  processingIndex: number | null;
  onDownload: (imageData: string) => void;
  onUseAsInput: (imageData: string) => void;
  onUseAsComfyInput: (imageData: string) => void;
  onEnhance: (index: number) => void;
  onFixFace: (index: number) => void;
  onUpscale: (index: number) => void;
  onRemoveWatermark: (index: number) => void;
  onMagicEdit: (index: number) => void;
  onShare: (entry: GenerationHistoryEntry) => void;
}

const ImageActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    tooltip: string;
    children: React.ReactNode;
}> = ({ onClick, disabled, tooltip, children }) => (
    <div className="relative group/button">
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className="p-3 bg-bg-tertiary/80 rounded-full text-text-primary/80 hover:bg-accent hover:text-white disabled:bg-bg-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all"
        >
            {children}
        </button>
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-bg-primary text-text-primary px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover/button:opacity-100 transition-opacity pointer-events-none z-20">
            {tooltip}
        </span>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    images, isLoading, isComfyUiMode, comfyUiProgress, processingIndex, onDownload, onUseAsInput, onUseAsComfyInput, onEnhance, onFixFace,
    onUpscale, onRemoveWatermark, onMagicEdit, onShare
}) => {
  if (isLoading && images.length === 0) {
    let message = "Generating your masterpiece...";
    let subMessage: string | undefined = "This can take a moment. Please wait.";

    if (isComfyUiMode) {
        message = "Communicating with ComfyUI...";
        subMessage = "Check your ComfyUI console for detailed progress.";
        if (comfyUiProgress) {
            const percent = Math.round((comfyUiProgress.value / comfyUiProgress.max) * 100);
            message = `Rendering... (${percent}%)`;
            subMessage = `${comfyUiProgress.value} / ${comfyUiProgress.max} steps complete.`;
        }
    }
    
    return <LoadingSpinner 
        message={message} 
        subMessage={subMessage} 
        progress={comfyUiProgress} 
    />;
  }
  
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center text-center p-8 bg-bg-secondary/50 rounded-lg text-text-secondary/70 border-2 border-dashed border-border-primary">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-lg font-semibold">Your generated images will appear here.</p>
          <p className="text-sm">Enter a prompt above and click "Generate" to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {images.map((entry, index) => (
        <div key={entry.id} className="bg-bg-secondary rounded-lg shadow-lg overflow-hidden relative group">
          <img src={entry.imageDataUrl} alt={`Generated art ${index + 1}`} className="w-full h-auto object-contain transition-opacity duration-300" />
          
          {processingIndex === index && (
             <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                <LoadingSpinner message="Processing..." subMessage="AI is working its magic."/>
             </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-end">
              
              <div className="flex justify-center items-center gap-2 flex-wrap">
                  <ImageActionButton onClick={() => onDownload(entry.imageDataUrl)} disabled={processingIndex !== null} tooltip="Download Image">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </ImageActionButton>
                   <ImageActionButton onClick={() => onShare(entry)} disabled={processingIndex !== null} tooltip="Share Recipe">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                  </ImageActionButton>
                  <ImageActionButton onClick={() => onUseAsInput(entry.imageDataUrl)} disabled={processingIndex !== null} tooltip="Use as Cloud Img2Img Input">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  </ImageActionButton>
                  <ImageActionButton onClick={() => onEnhance(index)} disabled={processingIndex !== null} tooltip="Enhance Quality & Detail">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  </ImageActionButton>
                  <ImageActionButton onClick={() => onFixFace(index)} disabled={processingIndex !== null} tooltip="Fix Facial Artifacts">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </ImageActionButton>
                   <ImageActionButton onClick={() => onMagicEdit(index)} disabled={processingIndex !== null} tooltip="Magic Edit (Cloud)">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                  </ImageActionButton>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageDisplay;