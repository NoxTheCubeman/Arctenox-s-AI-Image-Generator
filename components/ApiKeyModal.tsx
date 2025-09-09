import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onSaveApiKey: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKey, onSaveApiKey }) => {
    const [localKey, setLocalKey] = useState(apiKey);

    useEffect(() => {
        setLocalKey(apiKey);
    }, [apiKey, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSaveApiKey(localKey);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="api-key-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-md m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center">
                    <h2 id="api-key-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                        Manage Gemini API Key
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-text-secondary">
                        You can enter your own Google Gemini API key to use your personal quota. If left blank, the application will use its built-in key (if available). Your key is saved securely in your browser's local storage.
                    </p>
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-medium text-text-secondary mb-1">
                            Your API Key
                        </label>
                        <input
                            id="api-key-input"
                            type="password"
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                            placeholder="Enter your API key here"
                            className="w-full p-2 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent"
                        />
                    </div>
                     <p className="text-xs text-text-secondary/70">
                        You can get a free API key from{' '}
                        <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>.
                    </p>
                </div>
                 <div className="flex justify-end items-center p-4 border-t border-border-primary bg-bg-primary/50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors mr-2">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover transition-colors">
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
