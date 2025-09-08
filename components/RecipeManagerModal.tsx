import React, { useState } from 'react';
import type { GenerationRecipe, ImageConfig } from '../types';

interface RecipeManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipes: GenerationRecipe[];
    onSave: (name: string) => void;
    onDelete: (id: string) => void;
    onLoad: (recipe: GenerationRecipe) => void;
    onSetDefault: (id: string | null) => void;
    defaultRecipeId: string | null;
    currentPrompt: string;
}

const RecipeManagerModal: React.FC<RecipeManagerModalProps> = ({
    isOpen,
    onClose,
    recipes,
    onSave,
    onDelete,
    onLoad,
    onSetDefault,
    defaultRecipeId,
    currentPrompt,
}) => {
    const [recipeName, setRecipeName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (recipeName.trim() && currentPrompt.trim()) {
            onSave(recipeName.trim());
            setRecipeName('');
        }
    };
    
    const handleSetDefault = (recipeId: string) => {
        const isCurrentlyDefault = defaultRecipeId === recipeId;
        onSetDefault(isCurrentlyDefault ? null : recipeId);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="recipe-manager-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-lg m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center">
                    <h2 id="recipe-manager-title" className="text-xl font-bold text-text-primary">Manage Recipes</h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-2 p-4 bg-bg-primary/50 rounded-md">
                        <h3 className="font-semibold text-text-secondary">Save Current Prompt & Settings</h3>
                        <p className="text-sm text-text-secondary/70">
                            {currentPrompt.trim() ? 'Save the current prompt and all settings as a new recipe.' : 'Enter a prompt to save a recipe.'}
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                                placeholder="Enter recipe name"
                                className="flex-grow p-2 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent"
                                aria-label="Recipe name"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!recipeName.trim() || !currentPrompt.trim()}
                                className="px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-text-secondary">Your Recipes</h3>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {recipes.length === 0 ? (
                                <p className="text-text-secondary/50 text-sm text-center py-4">No saved recipes yet.</p>
                            ) : (
                                recipes.map(recipe => {
                                    const isDefault = recipe.id === defaultRecipeId;
                                    return (
                                        <div key={recipe.id} className="bg-bg-tertiary/50 p-3 rounded-md flex justify-between items-center animate-fade-in">
                                            <div>
                                                 <span className="font-medium text-text-primary truncate" title={recipe.name}>
                                                    {isDefault && <span className="text-accent mr-1" title="Default Recipe">⭐</span>}
                                                    {recipe.name}
                                                </span>
                                                <p className="text-xs text-text-secondary/70 truncate" title={recipe.prompt}>
                                                    {recipe.prompt}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                <button onClick={() => onLoad(recipe)} className="text-sm text-accent hover:text-text-primary transition-colors" title="Load this recipe">Load</button>
                                                <button onClick={() => handleSetDefault(recipe.id)} className="p-1.5 rounded-full hover:bg-bg-primary" title={isDefault ? 'Clear as default' : 'Set as default'}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDefault ? 'text-accent' : 'text-text-secondary/70'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </button>
                                                <button onClick={() => onDelete(recipe.id)} className="p-1.5 rounded-full text-danger/80 hover:text-danger hover:bg-bg-primary" aria-label={`Delete ${recipe.name} recipe`} title="Delete recipe">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="w-full mt-2 p-3 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary transition-colors rounded-b-lg">
                    Close
                </button>
            </div>
        </div>
    );
};

export default RecipeManagerModal;
