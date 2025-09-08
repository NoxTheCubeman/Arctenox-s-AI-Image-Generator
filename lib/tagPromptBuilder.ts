// lib/tagPromptBuilder.ts
import { TagCategories } from '../types';

// Helper functions
const pickRandom = <T>(arr: T[]): T | undefined => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
const pickRandomMultiple = <T>(arr: T[], count: number): T[] => {
    if (arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
};
const maybe = (chance: number, value: () => string | undefined): string[] => {
    if (Math.random() < chance) {
        const result = value();
        return result ? [result] : [];
    }
    return [];
};

// --- PROMPT RECIPES ---

/**
 * Recipe 1: Focus on a detailed character.
 */
const generateCharacterPrompt = (tags: TagCategories): string => {
    const promptParts: (string | undefined)[] = [];

    // Quality is always important
    promptParts.push(...pickRandomMultiple(tags["Quality"] || [], 2));
    
    // Character setup
    promptParts.push(pickRandom(tags["Character Count"] || ['1girl']));
    
    // Generate a random threshold between 0.4 and 0.7 for choosing anthro species
    const anthroThreshold = Math.random() * (0.7 - 0.4) + 0.4;
    const isAnthro = Math.random() < anthroThreshold;
    const speciesPool = isAnthro ? tags["Character Species (Anthro/Furry)"] : tags["Character Species (Danbooru)"];
    promptParts.push(...maybe(0.8, () => pickRandom(speciesPool || [])));
    
    promptParts.push(pickRandom(tags["Hair Color"] || []));
    promptParts.push(pickRandom(tags["Hair Style"] || []));
    promptParts.push(pickRandom(tags["Eye Color"] || []));
    promptParts.push(...pickRandomMultiple(tags["Body Features"] || [], Math.random() < 0.5 ? 1 : 2));
    
    // Clothing, pose, expression
    const hasFullOutfit = Math.random() < 0.3;
    if (hasFullOutfit) {
        const outfitPool = [...(tags["Character Themes"] || []), ...(tags["Dresses & Suits"] || [])];
        promptParts.push(pickRandom(outfitPool));
    } else {
        promptParts.push(pickRandom(tags["Tops"] || []));
        promptParts.push(pickRandom(tags["Bottoms"] || []));
        promptParts.push(...maybe(0.4, () => pickRandom(tags["Outerwear"] || [])));
    }
    promptParts.push(...maybe(0.6, () => pickRandom(tags["Headwear"] || [])));
    promptParts.push(...maybe(0.3, () => pickRandom(tags["Eyewear"] || [])));
    promptParts.push(...maybe(0.8, () => pickRandom(tags["Footwear"] || [])));
    promptParts.push(...maybe(0.5, () => pickRandom(tags["Accessories"] || [])));
    
    promptParts.push(pickRandom(tags["Pose & Action"] || []));
    promptParts.push(pickRandom(tags["Expression"] || []));
    
    // Environment and style
    promptParts.push(pickRandom(tags["Background & Environment"] || []));
    promptParts.push(...maybe(0.6, () => pickRandom(tags["Lighting"] || [])));
    promptParts.push(...maybe(0.5, () => pickRandom(tags["Camera & Angle"] || [])));
    promptParts.push(...maybe(0.4, () => pickRandom(tags["Composition"] || [])));
    promptParts.push(...maybe(0.3, () => pickRandom(tags["Photo Effects"] || [])));
    promptParts.push(...maybe(0.7, () => pickRandom(tags["Art Medium"] || [])));
    
    return Array.from(new Set(promptParts.filter(Boolean))).join(', ');
};

/**
 * Recipe 2: Focus on a scenic landscape.
 */
const generateLandscapePrompt = (tags: TagCategories): string => {
    const promptParts: (string | undefined)[] = [];

    promptParts.push(...pickRandomMultiple(tags["Quality"] || [], 3));
    promptParts.push('scenery', 'no humans');

    const mainEnv = pickRandom(tags["Background & Environment"] || []);
    promptParts.push(mainEnv);

    // Add more details based on the environment
    if (mainEnv?.includes('city')) {
        promptParts.push('towering skyscrapers', 'neon lights', 'flying vehicles');
    } else if (mainEnv?.includes('forest')) {
        promptParts.push('ancient trees', 'dappled sunlight', 'mossy rocks', 'babbling brook');
    } else if (mainEnv?.includes('mountains')) {
        promptParts.push('snow-capped peaks', 'vast valley', 'dramatic clouds');
    }

    // Time of day & weather
    promptParts.push(pickRandom(['day', 'night', 'sunset', 'sunrise', 'stormy weather', 'foggy']));
    
    // Style
    promptParts.push(pickRandom(tags["Lighting"] || []));
    promptParts.push(pickRandom(tags["Art Medium"] || []));
    promptParts.push(pickRandom(tags["Camera & Angle"] || []));
    promptParts.push(...maybe(0.6, () => pickRandom(tags["Composition"] || [])));
    promptParts.push(...maybe(0.5, () => pickRandom(tags["Photo Effects"] || [])));

    return Array.from(new Set(promptParts.filter(Boolean))).join(', ');
};

/**
 * Recipe 3: A more abstract or simple prompt.
 */
const generateSimplePrompt = (tags: TagCategories): string => {
    const promptParts: (string | undefined)[] = [];
    promptParts.push(...pickRandomMultiple(tags["Quality"] || [], 1));

    // A simple subject
    const subject = pickRandom([
        pickRandom(tags["Character Species (Danbooru)"] || []),
        pickRandom(tags["Character Species (Anthro/Furry)"] || []),
        'a mysterious artifact', 'a glowing portal', 'an enchanted sword'
    ]);
    promptParts.push(subject);
    
    // A simple background
    promptParts.push(pickRandom(tags["Background & Environment"] || []));

    // One or two strong style tags
    promptParts.push(pickRandom(tags["Art Medium"] || []));
    promptParts.push(...maybe(0.5, () => pickRandom(tags["Lighting"] || [])));
    
    return Array.from(new Set(promptParts.filter(Boolean))).join(', ');
};

// --- MAIN EXPORTED FUNCTION ---

const recipes = [
    generateCharacterPrompt, generateCharacterPrompt, generateCharacterPrompt, // Higher chance for character prompts
    generateLandscapePrompt, 
    generateSimplePrompt
];

/**
 * Generates a varied, high-quality random prompt by picking a random recipe.
 */
export const generateRandomizedPrompt = (tags: TagCategories): string => {
    const chosenRecipe = pickRandom(recipes);
    if (chosenRecipe) {
        return chosenRecipe(tags);
    }
    // Fallback to the character prompt if something goes wrong
    return generateCharacterPrompt(tags);
};
