import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onSaveApiKey: (key: string) => void;
}

const TroubleshootingStep: React.FC<{
    title: string;
    description: string;
    link: string;
    linkText: string;
    icon: React.ReactNode;
}> = ({ title, description, link, linkText, icon }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-accent mt-1">{icon}</div>
        <div>
            <h4 className="font-semibold text-text-primary">{title}</h4>
            <p className="text-sm text-text-secondary/90 mt-1">{description}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-bold text-accent hover:underline"
            >
                {linkText} &rarr;
            </a>
        </div>
    </div>
);


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
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="api-key-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                        API Key & Connection Guide
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </header>
                
                <main className="p-6 space-y-6 overflow-y-auto">
                    <section className="space-y-4">
                        <p className="text-sm text-text-secondary">
                            Enter your Google Gemini API key below. Your key is saved securely in your browser's local storage and is never sent to our servers.
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
                    </section>
                    
                    <section className="p-4 bg-bg-primary/50 border border-border-primary/50 rounded-lg space-y-4">
                        <h3 className="text-lg font-bold text-text-primary">Troubleshooting Common Errors</h3>
                        <p className="text-sm text-text-secondary">If you're seeing "Quota Exceeded" or other connection errors, please check the following in your Google Cloud project:</p>
                        
                        <div className="space-y-5 pt-2">
                             <TroubleshootingStep
                                title="1. Is your API Key correct?"
                                description="Ensure the key you pasted is correct and has no restrictions that would block its use from a web application."
                                link="https://console.cloud.google.com/apis/credentials"
                                linkText="Check Credentials"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-4l.293-.293a1 1 0 011.414 0l.293.293V12a6 6 0 0110-4.243z" /></svg>}
                            />
                            
                            <TroubleshootingStep
                                title="2. Is the 'Generative Language API' enabled?"
                                description="This is a common issue. The API key's project must have the correct API service enabled before it can be used."
                                link="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
                                linkText="Enable API"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            />
                            
                            <TroubleshootingStep
                                title="3. Is your Billing Account active?"
                                description="Even for free tier usage, Google Cloud requires an active and valid billing account to be linked to your project."
                                link="https://console.cloud.google.com/billing"
                                linkText="Check Billing"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                            />
                        </div>
                    </section>
                </main>

                <footer className="flex justify-end items-center p-4 border-t border-border-primary bg-bg-primary/50 rounded-b-lg flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors mr-2">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover transition-colors">
                        Save Key
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ApiKeyModal;
