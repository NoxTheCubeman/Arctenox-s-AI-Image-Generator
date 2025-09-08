import React, { useState } from 'react';

interface ResizableComfyUIEmbedProps {
    serverAddress: string;
    onSyncImages: (options?: { closeModal?: boolean }) => Promise<void>;
    onQueue: () => Promise<void>;
}

const ResizableComfyUIEmbed: React.FC<ResizableComfyUIEmbedProps> = ({ serverAddress, onSyncImages, onQueue }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isQueueing, setIsQueueing] = useState(false);

    let iframeSrc = '';
    try {
        const url = new URL(serverAddress);
        iframeSrc = url.origin;
    } catch (e) {
        console.error("Invalid ComfyUI server address for iframe:", serverAddress);
    }
    
    const handleSync = async () => {
        setIsSyncing(true);
        await onSyncImages({ closeModal: false });
        setIsSyncing(false);
    };

    const handleQueue = async () => {
        setIsQueueing(true);
        try {
            await onQueue();
        } finally {
            setIsQueueing(false);
        }
    };

    return (
        <div className="bg-bg-primary/50 border border-border-primary/50 rounded-lg flex flex-col animate-fade-in">
             <header className="bg-bg-tertiary/50 p-2 border-b border-border-primary/50 flex justify-between items-center flex-shrink-0">
                <h3 className="text-sm font-semibold text-text-secondary px-2">Embedded ComfyUI</h3>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={handleQueue}
                        disabled={isQueueing || isSyncing}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center gap-2"
                        title="Send the current prompt and settings to be generated in the background."
                    >
                         {isQueueing ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                        )}
                        Queue in Background
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || isQueueing}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 3a1 1 0 011 1v1.6a1 1 0 01-1 1H7.414l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 1.414L7.414 5H9a1 1 0 011 1zM10 17a1 1 0 01-1-1v-1.6a1 1 0 011-1h2.586l-1.293-1.293a1 1 0 111.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L12.586 15H11a1 1 0 01-1-1z" />
                            </svg>
                        )}
                        Sync Recent Images
                    </button>
                 </div>
            </header>
            <div 
                className="overflow-auto relative rounded-b-md bg-black h-[600px] min-h-[400px] resize-y"
            >
                {iframeSrc ? (
                    <iframe
                        src={iframeSrc}
                        className="w-full h-full border-none"
                        title="Resizable ComfyUI Embedded Interface"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-danger p-4">
                        <p>Invalid Server Address. Cannot display ComfyUI.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResizableComfyUIEmbed;
