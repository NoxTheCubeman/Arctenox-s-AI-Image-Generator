

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { GenerationHistoryEntry, ImageConfig } from '../types';

interface ImageDisplayProps {
  images: GenerationHistoryEntry[];
  isLoading: boolean;
  config: ImageConfig;
  onSelectCheckpointRequest: () => void;
  processingIndex: string | null;
  sendingToComfyId: string | null;
  onDownload: (imageData: string) => void;
  onCopyImage: (imageData: string) => void;
  onUseAsInput: (imageData: string) => void;
  onSendToComfyCanvas: (id: string, imageUrl: string) => void;
  onEnhance: (id: string, imageUrl: string) => void;
  onFixFace: (id: string, imageUrl: string) => void;
  onUpscale: (id: string, imageUrl: string) => void;
  onRemoveWatermark: (id: string, imageUrl: string) => void;
  onMagicEdit: (id: string, imageUrl: string) => void;
  onShare: (entry: GenerationHistoryEntry) => void;
  onDelete: (id: string) => void;
  onViewWorkflow: (workflowJson: string) => void;
  onRemix: (entry: GenerationHistoryEntry) => void;
}

const ImageActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    tooltip: string;
    children: React.ReactNode;
    variant?: 'default' | 'danger';
}> = ({ onClick, disabled, tooltip, children, variant = 'default' }) => {
    const baseClasses = "p-3 rounded-full disabled:bg-bg-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all";
    const variantClasses = variant === 'danger'
        ? "bg-danger-bg/80 text-danger hover:bg-danger hover:text-white"
        : "bg-bg-tertiary/80 text-[var(--color-icon-primary)] hover:bg-accent hover:text-white";

    return (
        <div className="relative group/button">
            <button 
                onClick={onClick} 
                disabled={disabled} 
                className={`${baseClasses} ${variantClasses}`}
                aria-label={tooltip}
            >
                {children}
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-bg-primary text-text-primary px-2 py-1 text-xs rounded-md shadow-lg opacity-0 group-hover/button:opacity-100 transition-opacity pointer-events-none z-20">
                {tooltip}
            </span>
        </div>
    );
}

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="flex items-center justify-center text-center p-8 bg-bg-secondary/50 rounded-lg text-text-secondary/70 border-2 border-dashed border-border-primary">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-lg font-semibold">{title}</p>
            <p className="text-sm">{subtitle}</p>
        </div>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    images, isLoading, config, onSelectCheckpointRequest, processingIndex, sendingToComfyId, onDownload, onCopyImage, onUseAsInput, onSendToComfyCanvas, onEnhance, onFixFace,
    onUpscale, onRemoveWatermark, onMagicEdit, onShare, onDelete, onViewWorkflow, onRemix
}) => {
  if (isLoading && images.length === 0) {
    return <LoadingSpinner />;
  }
  
  if (images.length === 0) {
    const isComfyMode = config.model === 'comfyui-local';
    const isCheckpointMissing = !config.selectedComfyUiCheckpoint;

    if (isComfyMode && isCheckpointMissing) {
        return (
             <div className="text-center space-y-4">
                 <button 
                    onClick={onSelectCheckpointRequest} 
                    className="px-6 py-3 font-bold text-text-primary bg-bg-secondary rounded-lg shadow-lg hover:bg-bg-tertiary transition-all transform hover:scale-105"
                 >
                    Select a Checkpoint
                 </button>
                 <EmptyState 
                    title="Your generated images will appear here." 
                    subtitle="Select a ComfyUI checkpoint model to begin."
                 />
             </div>
        )
    }

    return (
       <EmptyState 
           title="Your generated images will appear here."
           subtitle='Enter a prompt above and click "Generate" to begin.'
        />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {images.map((entry) => {
        const isProcessingThisImage = processingIndex === entry.id;
        const isSendingThisImage = sendingToComfyId === entry.id;
        const isAnyActionRunning = processingIndex !== null || sendingToComfyId !== null;

        return (
            <div key={entry.id} className="bg-bg-secondary rounded-lg shadow-lg overflow-hidden relative group">
              <img src={entry.imageDataUrl} alt={`Generated art for prompt: ${entry.prompt}`} className="w-full h-auto object-contain transition-opacity duration-300" />
              
              {isProcessingThisImage && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                    <LoadingSpinner message="Processing..." subMessage="AI is working its magic."/>
                 </div>
              )}

              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <ImageActionButton onClick={() => onDelete(entry.id)} disabled={isAnyActionRunning} tooltip="Delete Image" variant="danger">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                  </ImageActionButton>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-end">
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                      <ImageActionButton onClick={() => onDownload(entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Download Image">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </ImageActionButton>
                      <ImageActionButton onClick={() => onCopyImage(entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Copy Image">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                      </ImageActionButton>
                       <ImageActionButton onClick={() => onShare(entry)} disabled={isAnyActionRunning} tooltip="Copy Recipe">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                      </ImageActionButton>
                      <ImageActionButton onClick={() => onRemix(entry)} disabled={isAnyActionRunning} tooltip="Remix">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.186A1 1 0 0116 8.39V6a1 1 0 012 0v2.39a1 1 0 01-1 1h-2.39a1 1 0 01-.894-1.553A5.002 5.002 0 005.002 7.94V10a1 1 0 01-2 0V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      </ImageActionButton>
                      <ImageActionButton onClick={() => onUseAsInput(entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Use as Cloud Img2Img Input">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      </ImageActionButton>
                      {entry.comfyUiWorkflow && (
                        <ImageActionButton onClick={() => onViewWorkflow(entry.comfyUiWorkflow!)} disabled={isAnyActionRunning} tooltip="View ComfyUI Workflow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0zm8 8a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        </ImageActionButton>
                      )}
                      <ImageActionButton onClick={() => onEnhance(entry.id, entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Enhance Quality & Detail">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                      </ImageActionButton>
                      <ImageActionButton onClick={() => onFixFace(entry.id, entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Fix Facial Artifacts">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                      </ImageActionButton>
                      <ImageActionButton onClick={() => onUpscale(entry.id, entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Upscale & Enhance Detail">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </ImageActionButton>
                       <ImageActionButton onClick={() => onMagicEdit(entry.id, entry.imageDataUrl)} disabled={isAnyActionRunning} tooltip="Magic Edit (Cloud)">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                      </ImageActionButton>
                  </div>
              </div>
            </div>
        )
      })}
    </div>
  );
};

export default ImageDisplay;