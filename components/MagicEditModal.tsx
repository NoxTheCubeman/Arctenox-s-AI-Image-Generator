import React, { useState, useEffect } from 'react';

interface MagicEditModalProps {
    isOpen: boolean;
    isLoading: boolean;
    imageData: string | null;
    onClose: () => void;
    onSubmit: (editPrompt: string) => void;
}

const MagicEditModal: React.FC<MagicEditModalProps> = ({ isOpen, isLoading, imageData, onClose, onSubmit }) => {
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPrompt(''); // Reset prompt when modal is closed
        }
    }, [isOpen]);

    if (!isOpen || !imageData) return null;

    const handleSubmit = () => {
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="magic-edit-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center">
                    <h2 id="magic-edit-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /><path d="M14.5 2.5a1.5 1.5 0 011.06.44l3.5 3.5a1.5 1.5 0 010 2.12l-7.5 7.5a1.5 1.5 0 01-2.12 0l-3.5-3.5a1.5 1.5 0 010-2.12l7.5-7.5a1.5 1.5 0 011.06-.44zM10 7.5a.5.5 0 000 1h.5a.5.5 0 000-1H10zM8.5 9a.5.5 0 000 1h3a.5.5 0 000-1h-3z" /></svg>
                        Magic Edit
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-4 md:flex md:space-y-0 md:space-x-6">
                    <div className="md:w-1/2 flex-shrink-0">
                        <p className="text-sm text-text-secondary/70 mb-2">Original Image</p>
                        <img src={imageData} alt="Image to edit" className="rounded-lg w-full object-contain border border-border-primary" />
                    </div>
                    <div className="md:w-1/2 flex flex-col space-y-4">
                        <label htmlFor="magic-prompt" className="font-semibold text-text-secondary">Describe your edit:</label>
                        <textarea
                            id="magic-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a wizard hat on the cat', 'Remove the person on the left', 'Change the background to a snowy forest'"
                            className="w-full h-40 p-3 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent resize-none"
                            disabled={isLoading}
                        />
                         <button
                            onClick={handleSubmit}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full flex justify-center items-center p-3 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed"
                        >
                             {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Applying Edit...
                                </>
                             ) : 'Generate Edit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MagicEditModal;