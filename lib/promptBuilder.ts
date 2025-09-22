import type { ImageConfig, ArtisticStyle, CustomStylePreset } from '../types';

// --- PROMPT MODIFIERS ---
export const styleModifiers: Record<ArtisticStyle, string> = {
    'photorealistic': ', photorealistic, 8k, sharp focus, high detail',
    'anime': ', masterpiece, best quality, absurdres, highres, anime illustration, in a detailed modern anime style, beautiful detailed eyes, perfect composition, sharp lines, cinematic lighting, vibrant colors',
    'vibrant-anime': ', masterpiece, best quality, absurdres, highres, vibrant colors, detailed character design, cinematic lighting, Hexbloom aesthetic, beautiful detailed eyes, dynamic composition, anime key visual, trending on pixiv',
    'semi-realistic-2-5d': ', semi-realistic, 2.5d, masterpiece, best quality, ultra detailed, beautiful detailed lighting, intricate details, cinematic, trending on artstation',
    'pixai-aesthetic': ', pixai aesthetic, clean line art, vibrant, beautiful detailed eyes, perfect composition, masterpiece, best quality, highres',
    'ink-painting': ', ink wash painting, sumi-e style, traditional japanese ink, minimalist, bold brush strokes',
    'fantasy': ', epic fantasy art, digital painting, detailed, cinematic lighting',
    // FIX: Corrected a syntax error where the value was not a valid string.
    'cyberpunk': ', cyberpunk style, neon lighting, futuristic, cinematic, dystopian',
    'steampunk': ', steampunk aesthetic, gears and cogs, intricate details, brass and copper',
    'watercolor': ', watercolor painting style, soft edges, vibrant wash',
    'minimalist': ', minimalist style, simple, clean lines, abstract',
    'gothic': ', gothic horror style, dark, moody, atmospheric, dramatic shadows',
    'illustration': ', digital illustration, children\'s book style, vibrant, detailed',
    '3d-model': ', 3d model, octane render, professionally rendered, trending on cgsociety',
    'low-poly': ', low poly style, 3d render, isometric, simple colors',
    'pixel-art': ', pixel art, 16-bit, retro video game style, detailed sprites',
    'comic-book': ', comic book art, american comic style, bold lines, halftone dots, vibrant',
    'line-art': ', line art, clean lines, black and white, minimalist, vector style',
    'colored-line-art': ', colored line art, clean lines, vibrant colors, flat colors, minimalist, vector style',
    'isometric': ', isometric style, 3d render, diorama, detailed, high resolution',
    'vaporwave': ', vaporwave aesthetic, neon colors, retro-futuristic, 80s style, chrome text, glitch art',
    'ghibli-esque': ', ghibli studio art style, whimsical, hand-drawn, beautiful detailed backgrounds',
    'mecha': ', mecha design, giant robot, sci-fi, detailed mechanical parts, battle scene',
    'ukiyo-e': ', ukiyo-e style, japanese woodblock print, flat colors, distinctive line work, historical japan',
    'art-nouveau': ', art nouveau style, elegant, decorative, intricate patterns, flowing curved lines, organic forms',
    'baroque': ', baroque painting style, dramatic, rich deep color, intense light and dark shadows, emotional',
    'impressionism': ', impressionist painting style, small thin brush strokes, emphasis on accurate depiction of light, visible brushstrokes',
    'pop-art': ', pop art style, bold colors, blocky outlines, inspired by comic strips, andy warhol style',
    'cyber-gothic': ', cyber gothic fashion, dark ornate clothing, futuristic aesthetic, neon accents, intricate details, moody lighting',
    'anypastel': ', soft pastel colors, dreamy aesthetic, anime style, clean line art, low contrast, gentle lighting',
    'arc-fantasy': ', epic high fantasy, dramatic cinematic lighting, rich colors, detailed environment art',
    'arc-rococo': ', rococo art style, ornate details, elegant, pastel palette with gold trim, elaborate aristocratic fashion, delicate',
    'cinematic': ', cinematic, dramatic lighting, wide-angle, movie still, film grain, epic',
    'hyper-realism': ', hyperrealistic, extremely detailed, 8k, sharp focus, Unreal Engine 5 render, professional photography',
    'flatline-illus': ', flat line art illustration, niji style, vibrant colors, clean lines, 2d anime aesthetic',
    'ecaj-style': ', painterly illustration style, vibrant and saturated colors, expressive brushwork, beautiful character art, trending on artstation, by ecaj',
    'rpaws-anthro': ', cute anthro character art, furry art style, soft shading, clean lines, wholesome, sfw, by redactedpaws',
    'valentine-designs': ', detailed semi-realistic art, dark fantasy aesthetic, intricate details, dramatic lighting, polished character design, by valentinedesigns',
    'anything-style': ', anything v5 style, high quality anime illustration, beautiful detailed eyes, perfect composition, masterpiece',
    'concept-art': ', concept art, character design sheet, environment concept, rough sketch, professionally designed',
    'sticker-style': ', die-cut sticker design, vector art, vibrant colors, thick white border, simple background',
    'pony-diffusion-xl': ', pony diffusion xl style, high quality anime, beautiful composition, detailed character, vibrant colors, sfw',
    'shinkai-makoto': ', Makoto Shinkai anime style, breathtaking beautiful scenery, detailed backgrounds, dramatic lighting, vibrant colors, cinematic',
    'lo-fi': ', lo-fi aesthetic, chillhop style, relaxed cozy vibe, anime character studying, soft colors, grainy filter, night time',
    'claymation': ', claymation style, stop-motion animation, plasticine model, detailed textures, Aardman animations style',
    'colored-pencil': ', colored pencil drawing, hand-drawn, sketchbook style, textured paper, layered colors, cross-hatching, visible strokes',
    'colored-sketch': ', colored sketch, hand-drawn, sketchbook style, rough lines, visible pencil strokes, cross-hatching, lightly colored, loose coloring',
    'papercraft': ', papercraft style, paper cutout art, layered paper, vibrant colors, handcrafted look, 2d illustration',
    'splatter-art': ', abstract expressionism, splatter art, drip painting, chaotic, dynamic, vibrant, Jackson Pollock style',
    'retro-anime-90s': ', 90s retro anime style, cel animation, vintage look, soft colors, film grain, nostalgic',
    'arctenox-style': ', illustrious artist style, beautiful semi-realistic fantasy art, elegant character design, painterly, intricate details, glowing effects, masterpiece, by arctenox',
    'redactedpaws-style': ', clean and cute character art, wholesome, sfw, furry art style, by redactedpaws',
    'kegant-style': ', Kegant style, beautiful detailed anime illustration, painterly, textured brush strokes, semi-realistic, intricate details, masterpiece',
    'film-grain': ', film grain, cinematic, vintage film look, noisy texture, grainy',
    'gritty': ', gritty, textured, dark, high contrast, rough, raw aesthetic',
    'anime-fantasy': ', anime fantasy style, magical, enchanted, detailed armor and robes, mystical creatures, epic scenery',
    'anime-dark-fantasy': ', dark fantasy anime style, gothic, moody, grimdark atmosphere, Berserk inspired, detailed line art, dramatic shading, high contrast',
    'modern-anime': ', modern anime style, crisp digital art, vibrant colors, clean lines, trending on pixiv, high quality animation key visual',
    'novelai-style': ', masterpiece, best quality, absurdres, highres, novelai aesthetic, anime screencap, beautiful detailed eyes, perfect composition',
    'danbooru-style': ', danbooru tag style, tag-based prompt, masterpiece, best quality, absurdres, detailed',
    'e621-style': ', e621 tag style, furry art, anthro, tag-based prompt, masterpiece, best quality, absurdres, detailed',
    'chibi': ', chibi style, cute, small proportions, large expressive eyes, super deformed',
    'gouache': ', gouache painting, opaque colors, matte finish, bold, vibrant, detailed illustration',
    'hologram-glitch': ', hologram, holographic, glitch art, digital distortion, cyberpunk aesthetic, neon blue and pink, futuristic',
    'art-deco': ', art deco style, bold geometric shapes, clean lines, symmetrical, lavish ornamentation, 1920s aesthetic',
    'hyphoria-illu': ', hyphoria illustration style, beautiful detailed anime, high quality, vibrant colors, soft lighting, detailed face, perfect composition, nai aesthetic',
    'film-noir': ', film noir style, black and white, high contrast, dramatic shadows, moody, 1940s aesthetic',
    'tribal-art': ', tribal art style, indigenous patterns, geometric shapes, bold lines, earthy tones',
    'sketch': ', pencil sketch style, hand-drawn, rough lines, charcoal, black and white, sketchbook aesthetic',
    'psychedelic': ', psychedelic art, vibrant swirling colors, abstract patterns, surreal, trippy, 60s rock poster style',
    'glassmorphism': ', glassmorphism style, frosted glass effect, translucent layers, blurred background, 3d render, clean aesthetic',
    'double-exposure': ', double exposure effect, silhouette of a person combined with a nature scene, artistic, creative photography',
    'abstract-tech': ', abstract technology, data visualization, glowing circuits, network of nodes, dark background, futuristic, complex',
    'certified-rat-style': ', cute and clean character art, soft pastel colors, wholesome, high quality illustration, polished, sfw, by KookiePum',
    'painterly': ', painterly style, expressive brush strokes, textured, digital painting, impasto, trending on artstation',

    // New Anime Styles
    'gachiakuta-manga': ', gachiakuta manga style, gritty detailed inkwork, dynamic composition, urban fantasy, rough textures, expressive line art',
    'jujutsu-kaisen': ', jujutsu kaisen anime style, mappa studio, dark modern fantasy, cinematic composition, cursed energy effects, detailed action scene',
    'chainsaw-man': ', chainsaw man anime style, mappa studio, gritty, raw, cinematic, dark horror, film grain, visceral',
    'oshi-no-ko': ', oshi no ko anime style, doga kobo, vibrant colors, beautiful detailed star-like eyes, idol anime style, clean line art, expressive characters',
    'frieren-anime': ', frieren beyond journeys end anime style, madhouse studio, painterly backgrounds, soft fantasy aesthetic, beautiful scenery, nostalgic, storybook illustration',
    'dandadan-manga': ', dandadan manga style, highly dynamic, energetic line art, chaotic action, sci-fi horror comedy, bold inkwork, expressive faces',
    'solo-leveling': ', solo leveling anime style, manhwa style, sharp line art, glowing magical effects (blue and purple), action-packed, dark fantasy, vibrant colors',
    'blue-lock': ', blue lock anime style, intense sports manga, sharp angular lines, dynamic motion, expressive puzzle-piece eyes, high energy, dramatic shading',
    'bocchi-the-rock': ', bocchi the rock anime style, cloverworks, cute girls doing cute things, slice of life, surreal and stylized animation, comedic, vibrant pastel colors',
    
    // New styles
    'novelai-anime-v3': ', masterpiece, best quality, absurdres, highres, novelai anime v3 aesthetic, beautiful detailed eyes, perfect composition, anime screencap',
    'novelai-furry-diffusion': ', furry art, anthro, novelai furry diffusion aesthetic, masterpiece, best quality, absurdres, highres, detailed character design',
    'civitai-epic-realism': ', epic realism, cinematic lighting, dramatic, trending on civitai, hyperdetailed, sharp focus, photography, 8k',
    'civitai-concept-masterpiece': ', character concept art, environment design, masterpiece, trending on artstation, detailed, rough brush strokes, professional',
    'civitai-semi-realistic': ', 2.5d, semi-realistic, beautiful detailed face, intricate details, painterly, trending on civitai',
    'seaart-exquisite-detail': ', exquisite details, SeaArt AI style, masterpiece, best quality, ultra-detailed, cinematic lighting, vibrant colors',
    'seaart-ancient-style': ', ancient art style, traditional chinese painting, guochao, ink wash, elegant, seaart ai',
    'seaart-mecha-warrior': ', mecha, sci-fi warrior, gundam style, intricate mechanical details, cinematic, powerful stance, seaart ai',
    'pixai-moonbeam': ', pixai moonbeam model style, ethereal, soft lighting, dreamy aesthetic, anime illustration, beautiful detailed eyes',
    'pixai-realism': ', pixai realism engine, photorealistic, hyper-detailed, sharp focus, professional photography',
    
    // Styles from user images
    'high-contrast-manga': ', manga style, black and white, monochrome, high contrast, detailed line art, hatching, ink drawing, sharp lines, dramatic shadows',
    'volcanic-soul': ', obsidian skin, cracked lava texture, internal fire, glowing embers, elemental demon, painterly, digital painting, fantasy concept art, dramatic lighting',
    'crystalline-frost': ', crystalline body, fractured ice texture, internal glowing frost, cold blue light, elemental golem, painterly, digital painting, fantasy concept art, dramatic lighting',
    'gothic-anime': ', dark anime style, gothic, elegant, muted color palette, beautiful detailed eyes, sharp lines, dark and moody atmosphere, character portrait',
    'polished-furry': ', modern anthro style, furry art, semi-realistic, clean shading, detailed fur texture, expressive character portrait, high quality, trending on artstation',
    'webtoon-style': ', webtoon style, manhwa art style, clean line art, soft cell shading with gradients, character portrait, vertical format aesthetic',
    'ethereal-anime-painting': ', soft lighting, painterly anime style, semi-realistic, 2.5D, beautiful detailed face, delicate features, ethereal, dreamy atmosphere, trending on pixiv',
    'rendered-digital-art': ', highly polished digital painting, clean line art, smooth shading and rendering, detailed character art, professional illustration, trending on artstation',
    'cel-shaded-illustration': ', cel shading, bold outlines, flat colors with minimal gradients, anime key visual style, official art, vibrant',
    'tactical-anime': ', masterpiece, best quality, ultra detailed, modern anime style, gritty, detailed sharp line art, muted color palette, high contrast, cinematic lighting',
    
    // Styles from new images
    'vibrant-abstract-painting': ', vibrant abstract painting style, expressive brush strokes, colorful blocky background, modern anime character, masterpiece',
    'glossy-airbrushed-anime': ', glossy airbrushed anime, 2.5d style, high specularity, shiny skin, vibrant saturated colors, polished rendering, masterpiece, trending on pixiv',
    'high-resolution-pixel-art': ', high resolution pixel art, detailed, intricate, sharp pixels, vibrant colors, trending on behance',

    // More unique styles
    'stained-glass-window': ', stained glass window art style, vibrant colors, intricate leaded lines, glowing light, masterpiece, detailed',
    'tarot-card': ', tarot card illustration, art nouveau style, symbolic imagery, intricate border, mystical, occult, detailed line art, masterpiece',
    'riso-print': ', risograph print style, limited color palette, grainy texture, layered colors, halftone, screen printing aesthetic, indie art',
    'art-deco-futurism': ', art deco futurism, sleek geometric shapes, metallic accents, retro-futuristic, Metropolis movie aesthetic, grand scale, elegant',
    'golden-hour-photography': ', golden hour photography, soft warm light, long shadows, lens flare, bokeh, photorealistic, cinematic, beautiful',
    'trigger-studio-style': ', Studio Trigger anime style, hyper-kinetic action, explosive effects, sharp angular character design, vibrant, high-energy, Gurren Lagann, Kill la Kill, Promare',
    'ufotable-style': ', Ufotable anime style, cinematic lighting, deep shadows, incredible particle effects, polished digital animation, detailed backgrounds, Demon Slayer, Fate series',
    'kyoto-animation-style': ', Kyoto Animation style, soft character designs, beautiful detailed eyes, expressive animation, detailed backgrounds, emotional, slice of life, KyoAni aesthetic',
};

const detailModifiers: Record<string, string> = {
    '-5': ', very abstract, impressionistic, minimalist',
    '-4': ', abstract, minimalist',
    '-3': ', simple shapes, minimalist',
    '-2': ', minimalist, low detail',
    '-1': ', simple details',
    '0': '',
    '1': ', detailed',
    '2': ', highly detailed, intricate',
    '3': ', ornate, complex details',
    '4': ', hyperdetailed, maximalist',
    '5': ', extremely detailed, professional, 8k',
};

const intensityModifiers: Record<string, string> = {
    '-10': ', extremely subtle, desaturated, washed out, low contrast',
    '-9': ', very desaturated, very low contrast',
    '-8': ', desaturated, low contrast',
    '-7': ', muted colors, soft lighting',
    '-6': ', gentle colors, soft',
    '-5': ', very subtle, soft lighting, low contrast, desaturated',
    '-4': ', subtle, muted tones',
    '-3': ', understated',
    '-2': ', slightly softened',
    '-1': ', less intense',
    '0': '',
    '1': ', slightly enhanced, vibrant',
    '2': ', moderately intense, vibrant colors',
    '3': ', intense, high contrast',
    '4': ', very intense, dramatic lighting',
    '5': ', extremely intense, hyper-detailed, dramatic composition',
    '6': ', extremely vibrant, dramatic lighting',
    '7': ', hyper-vibrant, intense colors',
    '8': ', overwhelming intensity, high contrast lighting',
    '9': ', extreme contrast, dramatic and vibrant',
    '10': ', maximalist intensity, explosive contrast and color',
};


/**
 * Builds a prompt for ComfyUI and serves as the base for getFullPrompt.
 * It intelligently combines and de-duplicates keywords for a cleaner, more effective prompt.
 */
export function getComfyPrompt(prompt: string, config: ImageConfig, customStyles: CustomStylePreset[]): string {
    const corePrompt = prompt.trim();
    const prefix = config.promptPrefix.trim();

    // Collect all keyword strings from different sources
    const styleKeywords = config.styles.map(styleId => {
        if (styleId in styleModifiers) {
            return styleModifiers[styleId as ArtisticStyle];
        }
        const custom = customStyles.find(cs => cs.id === styleId);
        return custom ? custom.prompt : '';
    }).filter(Boolean);

    const suffixKeywords = config.promptSuffix ? [config.promptSuffix] : [];
    const detailKeywords = detailModifiers[config.detailLevel.toString()] || '';
    const intensityKeywords = intensityModifiers[config.styleIntensity.toString()] || '';

    const allKeywordStrings = [
        ...styleKeywords,
        ...suffixKeywords,
        detailKeywords,
        intensityKeywords
    ].filter(Boolean); // Remove any null/empty strings

    // Create a unique, ordered set of keywords
    // This process cleans up the keywords, removes duplicates, and ensures a consistent order.
    const keywordSet = new Set(
        allKeywordStrings.flatMap(keywordString =>
            keywordString.split(',').map(s => s.trim()).filter(Boolean)
        )
    );

    const finalKeywords = Array.from(keywordSet).join(', ');

    // Assemble the final prompt string
    let finalPrompt = prefix ? `${prefix} ${corePrompt}` : corePrompt;
    if (finalKeywords) {
        finalPrompt += `, ${finalKeywords}`;
    }

    return finalPrompt;
}


/**
 * Builds the full prompt for Gemini/Imagen models, including all modifiers and model-specific syntax.
 */
export function getFullPrompt(prompt: string, config: ImageConfig, customStyles: CustomStylePreset[]): string {
    // Start with the blended prompt from the ComfyUI builder
    let fullPrompt = getComfyPrompt(prompt, config, customStyles);

    // Add model-specific adjustments
    if (config.model === 'gemini-2.5-flash-image-preview') {
        fullPrompt += `, in a ${config.aspectRatio} aspect ratio`;
    }

    return fullPrompt;
}
