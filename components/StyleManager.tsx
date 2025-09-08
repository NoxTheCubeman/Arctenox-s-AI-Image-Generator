import React, { useState } from 'react';
import type { SavedStylePreset, CustomStylePreset } from '../types';

interface StyleManagerProps {
    isOpen: boolean;
    onClose: () => void;
    savedPresets: SavedStylePreset[];
    customStyles: CustomStylePreset[];
    currentStyles: string[];
    onSavePreset: (name: string) => void;
    onDeletePreset: (id: string) => void;
    onSaveCustomStyle: (name: string, prompt: string) => void;
    onDeleteCustomStyle: (id: string) => void;
    onApplyPreset: (styles: string[]) => void;
}

type ActiveTab = 'presets' | 'custom';

const StyleManager: React.FC<StyleManagerProps> = ({ 
    isOpen, onClose, savedPresets, customStyles, currentStyles, 
    onSavePreset, onDeletePreset, onSaveCustomStyle, onDeleteCustomStyle, onApplyPreset 
}) => {
    const [presetName, setPresetName] = useState('');
    const [customStyleName, setCustomStyleName] = useState('');
    const [customStylePrompt, setCustomStylePrompt] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('presets');

    if (!isOpen) return null;

    const handleSavePreset = () => {
        if (presetName.trim() && currentStyles.length > 0) {
            onSavePreset(presetName.trim());
            setPresetName('');
        }
    };

    const handleSaveCustom = () => {
        if (customStyleName.trim() && customStylePrompt.trim()) {
            onSaveCustomStyle(customStyleName.trim(), customStylePrompt.trim());
            setCustomStyleName('');
            setCustomStylePrompt('');
        }
    }

    const handleApply = (styles: string[]) => {
        onApplyPreset(styles);
        onClose();
    }

    const TabButton: React.FC<{tabId: ActiveTab, children: React.ReactNode}> = ({ tabId, children }) => (
        <button 
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${activeTab === tabId ? 'bg-bg-secondary text-text-primary' : 'bg-bg-primary/50 text-text-secondary/70 hover:bg-bg-secondary/80'}`}
            role="tab"
            aria-selected={activeTab === tabId}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="style-manager-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-lg m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex border-b border-border-primary px-6 pt-2">
                    <TabButton tabId="presets">Presets</TabButton>
                    <TabButton tabId="custom">Custom Styles</TabButton>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    {activeTab === 'presets' && (
                        <div role="tabpanel" className="space-y-4 animate-fade-in">
                             <h2 id="style-manager-title" className="text-xl font-bold text-text-primary">Manage Style Presets</h2>
                             <div className="p-3 bg-info-bg border border-info/50 rounded-md text-info text-sm">
                                <p className="font-semibold mb-1">A Note for Advanced Users:</p>
                                <p className="text-xs">The Google Gemini and Imagen APIs do not currently support "prompt weighting" or "style strength" (e.g., `(style:1.2)`). This syntax is specific to other AI systems. The best way to blend styles here is to select multiple options.</p>
                             </div>
                            <div className="space-y-2 p-4 bg-bg-primary/50 rounded-md">
                               <h3 className="font-semibold text-text-secondary">Save Current Selection as Preset</h3>
                               <p className="text-sm text-text-secondary/70">
                                   {currentStyles.length > 0 ? `Saving ${currentStyles.length} style(s) as a collection.` : 'Select at least one style to save.'}
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.target.value)}
                                        placeholder="Enter preset name"
                                        className="flex-grow p-2 bg-bg-tertiary border border-border-primary rounded-md text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent"
                                        aria-label="Preset name"
                                    />
                                    <button
                                        onClick={handleSavePreset}
                                        disabled={!presetName.trim() || currentStyles.length === 0}
                                        className="px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-text-secondary">Your Presets</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {savedPresets.length === 0 ? (
                                        <p className="text-text-secondary/50 text-sm text-center py-4">No saved presets yet.</p>
                                    ) : (
                                        savedPresets.map(preset => (
                                            <div key={preset.id} className="bg-bg-tertiary/50 p-3 rounded-md flex justify-between items-center animate-fade-in">
                                                <span className="font-medium text-text-primary truncate mr-2" title={preset.name}>{preset.name}</span>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button onClick={() => handleApply(preset.styles)} className="text-sm text-accent hover:text-text-primary transition-colors">Apply</button>
                                                    <button onClick={() => onDeletePreset(preset.id)} className="text-danger/80 hover:text-danger transition-colors" aria-label={`Delete ${preset.name} preset`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'custom' && (
                         <div role="tabpanel" className="space-y-4 animate-fade-in">
                             <h2 id="style-manager-title" className="text-xl font-bold text-text-primary">Create & Manage Custom Styles</h2>
                            <div className="space-y-3 p-4 bg-bg-primary/50 rounded-md">
                               <h3 className="font-semibold text-text-secondary">Create New Style</h3>
                               <input
                                    type="text"
                                    value={customStyleName}
                                    onChange={(e) => setCustomStyleName(e.target.value)}
                                    placeholder="Style Name (e.g., My Sketch Style)"
                                    className="w-full p-2 bg-bg-tertiary border border-border-primary rounded-md text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent"
                                    aria-label="New custom style name"
                                />
                                <textarea
                                    value={customStylePrompt}
                                    onChange={(e) => setCustomStylePrompt(e.target.value)}
                                    placeholder="Prompt Modifiers (e.g., charcoal sketch, black and white, rough paper)"
                                    className="w-full h-24 p-2 bg-bg-tertiary border border-border-primary rounded-md text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent resize-none"
                                    aria-label="New custom style prompt modifiers"
                                />
                                <button
                                    onClick={handleSaveCustom}
                                    disabled={!customStyleName.trim() || !customStylePrompt.trim()}
                                    className="w-full px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-colors"
                                >
                                    Save Custom Style
                                </button>
                            </div>
                             <div className="space-y-2">
                                <h3 className="font-semibold text-text-secondary">Your Custom Styles</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {customStyles.length === 0 ? (
                                        <p className="text-text-secondary/50 text-sm text-center py-4">No custom styles yet.</p>
                                    ) : (
                                        customStyles.map(style => (
                                            <div key={style.id} className="bg-bg-tertiary/50 p-3 rounded-md flex justify-between items-center animate-fade-in">
                                                <div>
                                                    <p className="font-medium text-text-primary truncate" title={style.name}>{style.name}</p>
                                                    <p className="text-xs text-text-secondary/70 truncate" title={style.prompt}>{style.prompt}</p>
                                                </div>
                                                <button onClick={() => onDeleteCustomStyle(style.id)} className="text-danger/80 hover:text-danger transition-colors flex-shrink-0 ml-4" aria-label={`Delete ${style.name} style`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="w-full mt-2 p-3 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary transition-colors rounded-b-lg">
                    Close
                </button>
            </div>
        </div>
    );
};

export default StyleManager;
