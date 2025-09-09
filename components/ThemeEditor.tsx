import React, { useState, useEffect, useRef } from 'react';
import type { CustomTheme } from '../types';
import { themes, themeVariableManifest } from '../lib/themes';
import { hexToRgbString, rgbStringToHex, generateRandomTheme } from '../lib/colorUtils';

interface ThemeEditorProps {
    isOpen: boolean;
    onClose: () => void;
    customThemes: CustomTheme[];
    onSaveTheme: (theme: CustomTheme) => void;
    onDeleteTheme: (id: string) => void;
    onSelectTheme: (id: string) => void;
    activeThemeId: string;
    onPreviewTheme: (theme: Partial<CustomTheme> | null) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ isOpen, onClose, customThemes, onSaveTheme, onDeleteTheme, onSelectTheme, activeThemeId, onPreviewTheme }) => {
    const [themeName, setThemeName] = useState('');
    const [colors, setColors] = useState(themes.dark);
    const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
    const [uiOpacity, setUiOpacity] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            handleNewTheme();
        }
    }, [isOpen]);

    // Effect for live previewing
    useEffect(() => {
        if (isOpen) {
            onPreviewTheme({
                name: themeName,
                colors,
                backgroundImage,
                uiOpacity,
            });
        }
    }, [isOpen, themeName, colors, backgroundImage, uiOpacity, onPreviewTheme]);

    const handleColorChange = (variable: string, value: string) => {
        if (variable.endsWith('-rgb')) {
            setColors(prev => ({ ...prev, [variable]: hexToRgbString(value) }));
        } else {
            setColors(prev => ({ ...prev, [variable]: value }));
        }
    };
    
    const handleRandomize = () => {
        const randomTheme = generateRandomTheme();
        setColors(randomTheme);
    };

    const handleSave = () => {
        if (!themeName.trim()) return;
        const newTheme: CustomTheme = {
            id: editingThemeId || crypto.randomUUID(),
            name: themeName.trim(),
            colors: { ...colors },
            backgroundImage: backgroundImage,
            uiOpacity: uiOpacity,
        };
        onSaveTheme(newTheme);
        handleNewTheme();
    };

    const handleLoadThemeForEdit = (theme: CustomTheme) => {
        setThemeName(theme.name);

        // Sanitize the loaded theme's colors to remove null/undefined values
        const sanitizedColors = Object.entries(theme.colors).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key as keyof typeof acc] = value;
            }
            return acc;
        }, {} as { [key: string]: string });
        
        setColors({ ...themes.dark, ...sanitizedColors }); // Merge sanitized colors over defaults
        setEditingThemeId(theme.id);
        setBackgroundImage(theme.backgroundImage);
        setUiOpacity(theme.uiOpacity ?? 1);
    };
    
    const handleNewTheme = () => {
        setThemeName('');
        setColors(themes.dark);
        setEditingThemeId(null);
        setBackgroundImage(undefined);
        setUiOpacity(1);
    }
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const imported = JSON.parse(content);
                
                const themesToImport: CustomTheme[] = Array.isArray(imported) ? imported : [imported];

                let importedCount = 0;
                for (const theme of themesToImport) {
                    if (theme.id && theme.name && typeof theme.colors === 'object') {
                        const themeExists = customThemes.some(ct => ct.id === theme.id);
                        const themeToSave = {
                            ...theme,
                            id: themeExists ? crypto.randomUUID() : theme.id
                        };
                        onSaveTheme(themeToSave);
                        importedCount++;
                    } else {
                        console.warn("Skipping invalid theme object during import:", theme);
                    }
                }
                alert(`Successfully imported ${importedCount} theme(s).`);

            } catch (error) {
                alert(`Error importing theme(s): ${(error as Error).message}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleExportTheme = (theme: CustomTheme) => {
        const jsonString = JSON.stringify(theme, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `theme_${theme.name.replace(/\s+/g, '_')}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="theme-editor-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <h2 id="theme-editor-title" className="text-xl font-bold text-text-primary p-4 border-b border-border-primary flex-shrink-0">Theme Editor</h2>
                
                <div className="flex flex-grow overflow-hidden">
                    {/* Left Panel: Theme List */}
                    <div className="w-1/3 border-r border-border-primary flex flex-col">
                        <div className="p-4 flex-shrink-0 grid grid-cols-1 gap-2">
                            <button onClick={handleNewTheme} className="w-full px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover transition-colors">
                                + Create New Theme
                            </button>
                             <button onClick={handleRandomize} className="w-full px-4 py-2 font-semibold text-accent bg-accent/20 rounded-md hover:bg-accent/30 transition-colors flex items-center justify-center gap-2">
                                ✨ Randomize Theme
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden"/>
                            <button onClick={handleImportClick} className="w-full px-4 py-2 font-semibold text-accent bg-accent/20 rounded-md hover:bg-accent/30 transition-colors flex items-center justify-center gap-2">
                                📥 Import from File
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                             <h3 className="font-semibold text-text-secondary text-sm px-2">CUSTOM THEMES</h3>
                            {customThemes.length === 0 ? (
                                <p className="text-text-secondary/50 text-sm text-center py-4">No custom themes yet.</p>
                            ) : (
                                customThemes.map(theme => (
                                    <div key={theme.id} className={`p-2 rounded-md flex justify-between items-center cursor-pointer ${editingThemeId === theme.id ? 'bg-accent/30' : 'hover:bg-bg-tertiary'}`} onClick={() => handleLoadThemeForEdit(theme)}>
                                        <span className="font-medium text-text-primary truncate mr-2" title={theme.name}>{theme.name}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {activeThemeId !== theme.id && (
                                                <button onClick={(e) => { e.stopPropagation(); onSelectTheme(theme.id); }} className="p-1.5 rounded-md hover:bg-bg-primary text-accent" title="Apply Theme"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                            )}
                                             <button onClick={(e) => { e.stopPropagation(); handleExportTheme(theme); }} className="p-1.5 rounded-md hover:bg-bg-primary text-accent" title="Export Theme"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteTheme(theme.id); if (editingThemeId === theme.id) { handleNewTheme() } }} className="p-1.5 rounded-md hover:bg-bg-primary text-danger" aria-label={`Delete ${theme.name} theme`} title="Delete Theme">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Color Pickers */}
                    <div className="w-2/3 flex-grow overflow-y-auto p-6 space-y-4 bg-bg-secondary">
                        <div>
                             <label htmlFor="theme-name" className="block text-sm font-medium text-text-secondary mb-1">Theme Name</label>
                             <input
                                id="theme-name"
                                type="text"
                                value={themeName}
                                onChange={(e) => setThemeName(e.target.value)}
                                placeholder="My Awesome Theme"
                                className="w-full p-2 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div className="space-y-3 p-4 bg-bg-primary/50 rounded-md">
                            <h3 className="font-semibold text-text-secondary">Background Settings</h3>
                             <div>
                                <label htmlFor="bg-image-upload" className="block text-sm font-medium text-text-secondary mb-2">Background Image</label>
                                <input id="bg-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-text-secondary/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30"/>
                                {backgroundImage && <img src={backgroundImage} alt="preview" className="mt-2 rounded-md h-20 object-cover w-full"/>}
                             </div>
                             <div>
                                <label htmlFor="ui-opacity" className="block text-sm font-medium text-text-secondary mb-1">UI Opacity: {Math.round(uiOpacity * 100)}%</label>
                                <input id="ui-opacity" type="range" min="0.1" max="1" step="0.05" value={uiOpacity} onChange={(e) => setUiOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-slider-track-bg rounded-lg appearance-none cursor-pointer range-thumb disabled:cursor-not-allowed" disabled={!backgroundImage} />
                                {!backgroundImage && <p className="text-xs text-text-secondary/50 mt-1">A background image must be selected to use opacity.</p>}
                             </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {Object.entries(themeVariableManifest).filter(([key]) => !['uiOpacity', 'backgroundImage'].includes(key)).map(([variable, label]) => {
                                const isRgb = variable.endsWith('-rgb');
                                const value = isRgb ? rgbStringToHex(colors[variable]) : colors[variable];
                                return (
                                <div key={variable} className="flex items-center justify-between">
                                    <label htmlFor={variable} className="text-sm text-text-secondary">{label}</label>
                                    <div className="flex items-center gap-2 border border-border-primary rounded-md px-2 bg-bg-tertiary">
                                        <span className="text-text-secondary/70 text-sm uppercase">{value}</span>
                                        <input
                                            id={variable}
                                            type="color"
                                            value={value || '#000000'}
                                            onChange={(e) => handleColorChange(variable, e.target.value)}
                                            className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                                            aria-label={`Select color for ${label}`}
                                        />
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t border-border-primary mt-auto flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors">
                        Close
                    </button>
                    <button onClick={handleSave} disabled={!themeName.trim()} className="px-6 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-colors">
                        {editingThemeId ? 'Save Changes' : 'Save New Theme'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeEditor;