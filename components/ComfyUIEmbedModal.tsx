import React, { useState, useEffect } from 'react';

interface ComfyUIEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverAddress: string;
    onSyncImages: (options?: { closeModal?: boolean }) => Promise<void>;
    nodeToCopy: string | null;
    onCopyComplete: () => void;
}

const ComfyUIEmbedModal: React.FC<ComfyUIEmbedModalProps> = ({ isOpen, onClose, serverAddress, onSyncImages, nodeToCopy, onCopyComplete }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'loading' | 'copying' | 'copied' | 'error'>('idle');

    // Effect 1: Initialize or reset state when modal opens/closes or node data changes.
    useEffect(() => {
        setIsIframeLoaded(false);
        if (isOpen && nodeToCopy) {
            setCopyStatus('loading');
        } else if (!isOpen) {
            setCopyStatus('idle');
        }
    }, [isOpen, nodeToCopy]);

    // Effect 2: Transition from 'loading' to 'copying' state once the iframe is ready.
    // This decouples the state transition from the actual copy action.
    useEffect(() => {
        if (copyStatus === 'loading' && isIframeLoaded) {
            setCopyStatus('copying');
        }
    }, [copyStatus, isIframeLoaded]);

    // Effect 3: Perform the copy action when the state becomes 'copying'.
    // This effect's timeout won't be prematurely cleared by other state changes.
    useEffect(() => {
        if (copyStatus === 'copying' && nodeToCopy) {
            // A delay to ensure the ComfyUI app inside the iframe has fully initialized its clipboard listeners.
            const timer = setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText(nodeToCopy);
                    setCopyStatus('copied');
                } catch (e) {
                    console.error("Failed to copy node to clipboard:", e);
                    setCopyStatus('error');
                }
            }, 1000); // Increased delay for more stability

            return () => clearTimeout(timer);
        }
    }, [copyStatus, nodeToCopy]);

    // Effect 4: Notify the parent component to clean up once the copy process is successful.
    useEffect(() => {
        if (copyStatus === 'copied') {
            onCopyComplete();
        }
    }, [copyStatus, onCopyComplete]);


    const handleSync = async () => {
        setIsSyncing(true);
        await onSyncImages({ closeModal: true });
        // The modal will be closed by the App component, so no need to call onClose here.
        setIsSyncing(false);
    };
    
    const handleManualCopy = async () => {
        if (!nodeToCopy) return;
        try {
            await navigator.clipboard.writeText(nodeToCopy);
            setCopyStatus('copied');
        } catch (e) {
            setCopyStatus('error');
            console.error("Manual copy failed:", e);
            alert("Failed to copy to clipboard. Your browser might be blocking it or the window may not be focused.");
        }
    };

    if (!isOpen) return null;

    let iframeSrc = '';
    try {
        const url = new URL(serverAddress);
        iframeSrc = url.origin;
    } catch (e) {
        console.error("Invalid ComfyUI server address for iframe:", serverAddress);
    }
    
    const StatusIndicator: React.FC = () => {
        const spinner = (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        );

        switch (copyStatus) {
            case 'loading':
                return (
                    <div className="text-sm text-warning flex items-center gap-2" role="status">
                        {spinner} Loading ComfyUI interface...
                    </div>
                );
            case 'copying':
                return (
                    <div className="text-sm text-info flex items-center gap-2" role="status">
                        {spinner} Copying node...
                    </div>
                );
            case 'copied':
                return (
                    <div className="text-sm text-success font-semibold flex items-center gap-2" role="status">
                        <span>✔️ Node copied! Press Ctrl+V in the canvas.</span>
                        <button onClick={handleManualCopy} className="text-xs font-bold text-accent hover:underline">Copy Again</button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-sm text-danger font-semibold flex items-center gap-2" role="alert">
                        <span>❌ Auto-copy failed.</span>
                        <button onClick={handleManualCopy} className="text-xs font-bold text-accent hover:underline">Copy Manually</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-bg-primary z-40 flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="comfy-embed-title">
            <header className="bg-bg-secondary/80 backdrop-blur-sm p-3 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                <h2 id="comfy-embed-title" className="text-lg font-bold text-text-primary">
                    Live ComfyUI Interface
                </h2>
                <div className="flex items-center gap-4">
                     <StatusIndicator />
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 3a1 1 0 011 1v1.6a1 1 0 01-1 1H7.414l1.293 1.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 1.414L7.414 5H9a1 1 0 011 1zM10 17a1 1 0 01-1-1v-1.6a1 1 0 011-1h2.586l-1.293-1.293a1 1 0 111.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L12.586 15H11a1 1 0 01-1-1z" />
                            </svg>
                        )}
                        Sync & Close
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md">
                        Cancel
                    </button>
                </div>
            </header>
            <main className="flex-grow bg-black">
                {iframeSrc ? (
                     <iframe
                        src={iframeSrc}
                        className="w-full h-full border-none"
                        title="ComfyUI Embedded Interface"
                        onLoad={() => setIsIframeLoaded(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-danger">
                        <p>Invalid Server Address. Cannot display ComfyUI.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ComfyUIEmbedModal;