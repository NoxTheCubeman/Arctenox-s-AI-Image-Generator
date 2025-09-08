import React, { useState, useRef } from 'react';
import type { TagCategories } from '../types';
import { popularCommunityTags } from '../lib/tags';

interface TagManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    tags: TagCategories;
    onUpdateTags: (value: TagCategories | ((val: TagCategories) => TagCategories)) => void;
    onResetToDefaults: () => void;
}

const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose, tags, onUpdateTags, onResetToDefaults }) => {
    const [newTags, setNewTags] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Use functional updates for all state modifications to prevent issues with stale state.
    const handleAddTag = (category: string) => {
        const tagToAdd = newTags[category]?.trim();
        if (!tagToAdd) return;

        onUpdateTags(currentTags => {
            if (currentTags[category]?.includes(tagToAdd)) {
                return currentTags; // No change needed, tag already exists.
            }
            const updatedCategory = [...(currentTags[category] || []), tagToAdd].sort();
            return {
                ...currentTags,
                [category]: updatedCategory,
            };
        });
        setNewTags(prev => ({ ...prev, [category]: '' }));
    };

    const handleDeleteTag = (category: string, tagToDelete: string) => {
        onUpdateTags(currentTags => {
            const updatedCategory = (currentTags[category] || []).filter(tag => tag !== tagToDelete);
            return {
                ...currentTags,
                [category]: updatedCategory,
            };
        });
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const normalizeString = (str: string) => str.toLowerCase().replace(/[\s_&]+/g, '');

    const findMatchingCategory = (filename: string, categories: string[]): string | null => {
        const normalizedFilename = normalizeString(filename.replace(/\.[^/.]+$/, "")); // remove extension
        for (const category of categories) {
            if (normalizeString(category) === normalizedFilename) {
                return category;
            }
        }
        return null;
    };
    
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const fileReadPromises = Array.from(files).map(file => {
            return new Promise<{ name: string, content: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ name: file.name, content: e.target?.result as string });
                reader.onerror = (e) => reject(e);
                reader.readAsText(file);
            });
        });

        Promise.all(fileReadPromises).then(results => {
            onUpdateTags(currentTags => {
                const updatedTags: TagCategories = JSON.parse(JSON.stringify(currentTags)); // Deep copy for complex modifications

                results.forEach(({ name, content }) => {
                    const importedTags = content.split('\n').map(t => t.trim()).filter(Boolean);
                    if (importedTags.length === 0) return;

                    const matchedCategory = findMatchingCategory(name, Object.keys(updatedTags));
                    
                    if (matchedCategory) {
                        const existingTags = new Set(updatedTags[matchedCategory]);
                        importedTags.forEach(tag => existingTags.add(tag));
                        updatedTags[matchedCategory] = Array.from(existingTags).sort();
                    } else {
                        const newCategoryName = name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        updatedTags[newCategoryName] = Array.from(new Set(importedTags)).sort();
                    }
                });
                return updatedTags;
            });
        }).catch(err => {
            console.error("Error reading wildcard files:", err);
            alert("An error occurred while importing the files.");
        });

        if (event.target) event.target.value = '';
    };

    const handleSyncCommunityTags = () => {
        onUpdateTags(currentTags => {
            const updatedTags = JSON.parse(JSON.stringify(currentTags));
            const existingCategoryKeys = Object.keys(updatedTags);

            for (const category in popularCommunityTags) {
                const newTagsForCategory = popularCommunityTags[category as keyof typeof popularCommunityTags];
                const matchedCategory = findMatchingCategory(category, existingCategoryKeys);

                if (matchedCategory) {
                    const merged = new Set([...updatedTags[matchedCategory], ...newTagsForCategory]);
                    updatedTags[matchedCategory] = Array.from(merged).sort();
                } else {
                    updatedTags[category] = Array.from(new Set(newTagsForCategory)).sort();
                }
            }
            return updatedTags;
        });
    };

    const handleExport = (category: string, tagList: string[]) => {
        const content = tagList.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${category.replace(/\s+/g, '_').toLowerCase()}.txt`;
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const sortedCategories = Object.keys(tags).sort((a,b) => a.localeCompare(b));

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="tag-manager-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-5xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="tag-manager-title" className="text-xl font-bold text-text-primary">
                        Random Prompt Tag Manager
                    </h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSyncCommunityTags} className="text-sm font-semibold text-accent hover:text-text-primary flex items-center gap-1.5">
                           ✨ Sync Community Tags
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt" multiple className="hidden"/>
                        <button onClick={handleImportClick} className="text-sm font-semibold text-accent hover:text-text-primary flex items-center gap-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Import Wildcard(s)
                        </button>
                        <button onClick={onResetToDefaults} className="text-sm font-semibold text-danger hover:text-danger/80">Reset All to Defaults</button>
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedCategories.map((category) => (
                        <div key={category} className="bg-bg-tertiary p-3 rounded-lg flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-accent truncate" title={category}>{category}</h3>
                                <div className="flex items-center">
                                    <button onClick={() => handleExport(category, tags[category])} className="text-accent/70 hover:text-accent p-1" title={`Export ${category} as wildcard`}>
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow space-y-1 overflow-y-auto pr-2 max-h-60 mb-2 custom-scrollbar">
                                {tags[category].map(tag => (
                                    <div key={tag} className="group flex justify-between items-center text-sm bg-bg-primary/50 px-2 py-1 rounded-md">
                                        <span className="text-text-secondary truncate" title={tag}>{tag}</span>
                                        <button 
                                            onClick={() => handleDeleteTag(category, tag)} 
                                            className="text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" 
                                            title={`Delete tag: ${tag}`}
                                            aria-label={`Delete tag: ${tag}`}
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto flex gap-2 pt-2 border-t border-border-primary/50">
                                <input
                                    type="text"
                                    value={newTags[category] || ''}
                                    onChange={(e) => setNewTags(prev => ({...prev, [category]: e.target.value}))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(category)}
                                    placeholder="Add new tag..."
                                    className="flex-grow p-1 bg-input-bg border border-input-border rounded-md text-input-text text-sm placeholder-input-placeholder/70"
                                />
                                <button onClick={() => handleAddTag(category)} className="px-2 py-1 bg-accent text-white text-sm rounded-md hover:bg-accent-hover">+</button>
                            </div>
                        </div>
                    ))}
                </div>

                 <div className="p-4 border-t border-border-primary flex-shrink-0 text-right">
                     <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagManagerModal;