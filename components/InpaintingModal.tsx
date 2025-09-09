import React, { useState, useEffect, useRef } from 'react';
import type { GenerationHistoryEntry } from '../types';

interface InpaintingModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: GenerationHistoryEntry | null;
    onSubmit: (data: { image: string, mask: string, prompt: string }) => void;
    isLoading: boolean;
}

type Mode = 'inpaint' | 'outpaint';

const InpaintingModal: React.FC<InpaintingModalProps> = ({ isOpen, onClose, entry, onSubmit, isLoading }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const visibleCanvasRef = useRef<HTMLCanvasElement>(null); // For drawing feedback
    const maskCanvasRef = useRef<HTMLCanvasElement>(null); // For actual mask data
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<Mode>('inpaint');
    const [outpaintDirection, setOutpaintDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('top');
    const [outpaintAmount, setOutpaintAmount] = useState(256);
    const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });
    const [canvasState, setCanvasState] = useState({ x: 0, y: 0, width: 512, height: 512 });

    const resetState = () => {
        setPrompt('');
        setMode('inpaint');
        setBrushSize(40);
        clearMask();
    };

    // Load image and set up canvases
    useEffect(() => {
        if (isOpen && entry) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                imageRef.current = img;
                setImageDimensions({ width: img.width, height: img.height });
                const initialState = { x: 0, y: 0, width: img.width, height: img.height };
                setCanvasState(initialState);
                redrawCanvases(initialState, true);
                setPrompt(entry.prompt);
            };
            img.src = entry.imageDataUrl;
        } else {
            imageRef.current = null;
        }
    }, [isOpen, entry]);
    
    const redrawCanvases = (newState: {x:number, y:number, width:number, height:number}, clear: boolean = false) => {
        const visibleCanvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const img = imageRef.current;

        if (!visibleCanvas || !maskCanvas || !img) return;
        
        const oldMaskData = maskCanvas.toDataURL();

        visibleCanvas.width = newState.width;
        visibleCanvas.height = newState.height;
        maskCanvas.width = newState.width;
        maskCanvas.height = newState.height;

        const visibleCtx = visibleCanvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');
        if (!visibleCtx || !maskCtx) return;

        // Clear and draw background on visible canvas
        visibleCtx.clearRect(0, 0, newState.width, newState.height);
        visibleCtx.globalAlpha = 0.5;
        visibleCtx.fillStyle = '#000'; // Dark background for checkerboard
        visibleCtx.fillRect(0,0,newState.width, newState.height);
        visibleCtx.globalAlpha = 1.0;
        
        // Draw the main image
        visibleCtx.drawImage(img, newState.x, newState.y);
        
        if (clear) {
             maskCtx.fillStyle = 'black';
             maskCtx.fillRect(0, 0, newState.width, newState.height);
        } else {
            // Restore old mask data if not clearing
            const oldMaskImg = new Image();
            oldMaskImg.onload = () => {
                maskCtx.drawImage(oldMaskImg, 0, 0);
            };
            oldMaskImg.src = oldMaskData;
        }
    };


    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = visibleCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        // Scale mouse coordinates to match canvas resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== 'inpaint' || isLoading) return;
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => setIsDrawing(false);

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || mode !== 'inpaint' || isLoading) return;
        const { x, y } = getMousePos(e);
        
        const visibleCtx = visibleCanvasRef.current?.getContext('2d');
        const maskCtx = maskCanvasRef.current?.getContext('2d');

        if (visibleCtx && maskCtx) {
            // Draw on both canvases
            [visibleCtx, maskCtx].forEach(ctx => {
                 ctx.fillStyle = ctx === visibleCtx ? 'rgba(236, 64, 122, 0.5)' : 'white';
                 ctx.beginPath();
                 ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
                 ctx.fill();
            });
        }
    };
    
    const clearMask = () => {
        redrawCanvases(canvasState, true);
    };

    const handleExpandCanvas = () => {
        const img = imageRef.current;
        if (!img) return;
    
        const { x: oldX, y: oldY, width: oldWidth, height: oldHeight } = canvasState;
        
        let newX = oldX, newY = oldY, newWidth = oldWidth, newHeight = oldHeight;
        
        switch (outpaintDirection) {
            case 'top': 
                newHeight += outpaintAmount; 
                newY = outpaintAmount; 
                break;
            case 'bottom': 
                newHeight += outpaintAmount; 
                break;
            case 'left': 
                newWidth += outpaintAmount; 
                newX = outpaintAmount; 
                break;
            case 'right': 
                newWidth += outpaintAmount; 
                break;
        }
    
        const newState = { x: newX, y: newY, width: newWidth, height: newHeight };
        setCanvasState(newState);
        redrawCanvases(newState, true); // This will clear the mask canvas to black
    
        // Now, correctly draw the new mask for the outpainted area
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;
        
        maskCtx.fillStyle = 'white'; // The area to be generated
        
        // And also update the visible canvas for feedback
        const visibleCtx = visibleCanvasRef.current?.getContext('2d');
        if (!visibleCtx) return;
        visibleCtx.fillStyle = 'rgba(236, 64, 122, 0.5)';
    
        switch (outpaintDirection) {
            case 'top': 
                maskCtx.fillRect(0, 0, newWidth, outpaintAmount);
                visibleCtx.fillRect(0, 0, newWidth, outpaintAmount);
                break;
            case 'bottom': 
                maskCtx.fillRect(0, oldHeight, newWidth, outpaintAmount);
                visibleCtx.fillRect(0, oldHeight, newWidth, outpaintAmount);
                break;
            case 'left': 
                maskCtx.fillRect(0, 0, outpaintAmount, newHeight);
                visibleCtx.fillRect(0, 0, outpaintAmount, newHeight);
                break;
            case 'right': 
                maskCtx.fillRect(oldWidth, 0, outpaintAmount, newHeight);
                visibleCtx.fillRect(oldWidth, 0, outpaintAmount, newHeight);
                break;
        }
    };


    const handleSubmit = () => {
        const visibleCanvas = visibleCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const img = imageRef.current;
        if (!visibleCanvas || !maskCanvas || !img || !prompt.trim()) return;

        // Create a final image canvas without the mask overlay
        const finalImageCanvas = document.createElement('canvas');
        finalImageCanvas.width = visibleCanvas.width;
        finalImageCanvas.height = visibleCanvas.height;
        const finalCtx = finalImageCanvas.getContext('2d');
        if(finalCtx){
            finalCtx.fillStyle = 'black'; // Fill potential transparent areas
            finalCtx.fillRect(0,0,finalImageCanvas.width, finalImageCanvas.height);
            finalCtx.drawImage(img, canvasState.x, canvasState.y);
        }

        const image = finalImageCanvas.toDataURL('image/png');
        const mask = maskCanvas.toDataURL('image/png');
        onSubmit({ image, mask, prompt: prompt.trim() });
    };

    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="inpaint-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-6xl m-4 flex flex-col h-[95vh]" onClick={(e) => e.stopPropagation()}>
                <h2 id="inpaint-title" className="text-xl font-bold text-text-primary p-4 border-b border-border-primary flex-shrink-0">Inpainting & Outpainting Studio (via ComfyUI)</h2>
                <div className="flex flex-grow overflow-hidden">
                    {/* Left: Canvas */}
                    <div ref={containerRef} className="w-3/4 bg-bg-primary flex items-center justify-center p-4 overflow-auto">
                        <canvas ref={visibleCanvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw} className="max-w-full max-h-full object-contain cursor-crosshair" />
                        <canvas ref={maskCanvasRef} className="hidden" /> {/* Hidden mask canvas */}
                    </div>

                    {/* Right: Controls */}
                    <div className="w-1/4 border-l border-border-primary flex flex-col p-4 space-y-4 overflow-y-auto">
                        <div>
                           <label className="block text-sm font-medium text-text-secondary mb-1">Mode</label>
                           <div className="flex rounded-md shadow-sm">
                               <button onClick={() => setMode('inpaint')} className={`px-4 py-2 text-sm font-medium rounded-l-md w-1/2 ${mode === 'inpaint' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-primary hover:bg-bg-primary'}`}>Inpaint</button>
                               <button onClick={() => setMode('outpaint')} className={`px-4 py-2 text-sm font-medium rounded-r-md w-1/2 ${mode === 'outpaint' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-primary hover:bg-bg-primary'}`}>Outpaint</button>
                           </div>
                        </div>

                        {mode === 'inpaint' && (
                           <div className="animate-fade-in space-y-2">
                               <div>
                                   <label htmlFor="brush-size" className="block text-sm font-medium text-text-secondary mb-1">Brush Size: {brushSize}px</label>
                                   <input id="brush-size" type="range" min="10" max="200" step="2" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb" />
                               </div>
                               <button onClick={clearMask} className="w-full px-4 py-2 text-sm font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md">Clear Mask</button>
                           </div>
                        )}
                        
                        {mode === 'outpaint' && (
                             <div className="space-y-4 animate-fade-in">
                                 <div>
                                     <label htmlFor="outpaint-direction" className="block text-sm font-medium text-text-secondary mb-1">Expand Direction</label>
                                     <select id="outpaint-direction" value={outpaintDirection} onChange={e => setOutpaintDirection(e.target.value as any)} className="w-full p-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent">
                                         <option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
                                     </select>
                                 </div>
                                 <div>
                                    <label htmlFor="outpaint-amount" className="block text-sm font-medium text-text-secondary mb-1">Expand Amount: {outpaintAmount}px</label>
                                    <input id="outpaint-amount" type="range" min="64" max="512" step="64" value={outpaintAmount} onChange={e => setOutpaintAmount(Number(e.target.value))} className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb" />
                                 </div>
                                  <button onClick={handleExpandCanvas} className="w-full px-4 py-2 font-semibold text-text-primary bg-bg-tertiary hover:bg-bg-primary rounded-md">Expand Canvas</button>
                             </div>
                        )}

                        <div className="flex-grow flex flex-col space-y-2">
                           <label htmlFor="inpaint-prompt" className="block text-sm font-medium text-text-secondary">Prompt for Masked Area</label>
                           <textarea id="inpaint-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., a majestic castle, a beautiful sunset..." className="w-full h-full p-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-secondary/60 focus:ring-2 focus:ring-accent resize-none" />
                        </div>
                        
                        <div className="mt-auto flex-shrink-0 space-y-2">
                             <button onClick={handleSubmit} disabled={isLoading} className="w-full flex justify-center items-center p-3 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed">
                                 {isLoading ? 'Queueing...' : 'Queue & Open ComfyUI'}
                             </button>
                             <button onClick={() => { onClose(); resetState(); }} className="w-full px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InpaintingModal;