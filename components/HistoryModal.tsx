import React from 'react';
import type { GenerationHistoryEntry } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: GenerationHistoryEntry[];
    onLoad: (entry: GenerationHistoryEntry) => void;
    onDelete: (id: string) => void;
    onShare: (entry: GenerationHistoryEntry) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoad, onDelete, onShare }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="history-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="history-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Generation History
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center text-text-secondary/70">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="mt-2 text-lg font-semibold">No images generated yet.</p>
                                <p className="text-sm">Your saved creations will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map(entry => (
                                <div key={entry.id} className="bg-bg-tertiary rounded-lg shadow-md overflow-hidden group/item relative animate-fade-in">
                                    <img src={entry.imageDataUrl} alt={entry.prompt} className="w-full h-48 object-cover"/>
                                    <div className="p-3">
                                        <p className="text-xs text-text-secondary/80 truncate" title={entry.prompt}>{entry.prompt}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">{entry.config.model.replace('comfyui-local', 'ComfyUI')}</span>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => onLoad(entry)} className="p-1 rounded-full hover:bg-bg-primary" title="Load Settings"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.186A1 1 0 0116 8.39V6a1 1 0 012 0v2.39a1 1 0 01-1 1h-2.39a1 1 0 01-.894-1.553A5.002 5.002 0 005.002 7.94V10a1 1 0 01-2 0V3a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                                                <button onClick={() => onShare(entry)} className="p-1 rounded-full hover:bg-bg-primary" title="Copy Recipe"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg></button>
                                                <button onClick={() => onDelete(entry.id)} className="p-1 rounded-full hover:bg-bg-primary" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-danger" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;