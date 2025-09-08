import React, { useState } from 'react';

interface ComfyUIEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverAddress: string;
    onFetchImage: () => Promise<void>;
}

const ComfyUIEmbedModal: React.FC<ComfyUIEmbedModalProps> = ({ isOpen, onClose, serverAddress, onFetchImage }) => {
    const [isFetching, setIsFetching] = useState(false);

    const handleFetch = async () => {
        setIsFetching(true);
        await onFetchImage();
        setIsFetching(false);
    };

    if (!isOpen) return null;

    let iframeSrc = '';
    try {
        const url = new URL(serverAddress);
        iframeSrc = url.origin;
    } catch (e) {
        // If the address is invalid, we can show an error or a blank iframe
        console.error("Invalid ComfyUI server address for iframe:", serverAddress);
    }
    
    return (
        <div className="fixed inset-0 bg-bg-primary z-40 flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="comfy-embed-title">
            <header className="bg-bg-secondary/80 backdrop-blur-sm p-3 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                <h2 id="comfy-embed-title" className="text-lg font-bold text-text-primary">
                    Live ComfyUI Interface
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleFetch}
                        disabled={isFetching}
                        className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isFetching ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                        Fetch Latest Image
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md">
                        Close
                    </button>
                </div>
            </header>
            <main className="flex-grow bg-black">
                {iframeSrc ? (
                     <iframe
                        src={iframeSrc}
                        className="w-full h-full border-none"
                        title="ComfyUI Embedded Interface"
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
