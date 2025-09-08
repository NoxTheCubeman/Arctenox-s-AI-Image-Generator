// lib/tags.ts
import { TagCategories } from '../types';

export const initialManagedTags: TagCategories = {
    "Quality": [
        'masterpiece', 'best quality', 'high quality', 'absurdres', 'ultra detailed', '8k', 'sharp focus', 'professional', 'detailed background', 'detailed face', 'cinematic'
    ],
    "Character Count": [
        'solo', '1girl', '1boy', '2girls', '2boys', '3girls', '3boys', 'multiple girls', 'multiple boys', 'couple'
    ],
    "Character Species (Danbooru)": [
        'human', 'elf', 'cat girl', 'fox girl', 'dog girl', 'bunny girl', 'demon girl', 'angel', 'vampire', 'succubus', 'oni', 'dragon girl', 'centaur', 'harpy', 'mermaid', 'golem', 'ghost', 'zombie', 'orc', 'goblin'
    ],
    "Character Species (Anthro/Furry)": [
        'anthro fox', 'anthro wolf', 'anthro cat', 'anthro dog', 'anthro dragon', 'anthro rabbit', 'anthro bird', 'anthro deer', 'anthro horse', 'scalie', 'gryphon', 'kobold', 'sergal', 'protogen', 'rat', 'furry', 'furry female', 'furry male'
    ],
    "Animals": [
        'antelope', 'axolotl', 'badger', 'bat', 'bear', 'bee', 'bird', 'boar', 'butterfly', 'cat', 'cerberus', 'cheetah', 'clam', 'coral', 'cow', 'coyote', 'crab', 'crow', 'deer', 'dog', 'dolphin', 'dove', 'dragon', 'dragonfly', 'duck', 'eagle', 'eel', 'elephant', 'falcon', 'fish', 'flamingo', 'fox', 'gazelle', 'giraffe', 'goat', 'griffin', 'gryphon', 'hawk', 'hippogriff', 'horse', 'hummingbird', 'hyena', 'jellyfish', 'leopard', 'lion', 'lizard', 'lobster', 'monkey', 'moose', 'moth', 'mouse', 'octopus', 'otter', 'owl', 'panda', 'parrot', 'peacock', 'pegasus', 'penguin', 'phoenix', 'pigeon', 'pig', 'pufferfish', 'rabbit', 'raccoon', 'rat', 'rhinoceros', 'seal', 'seahorse', 'shark', 'sheep', 'shrimp', 'skunk', 'snake', 'squid', 'squirrel', 'starfish', 'stingray', 'swan', 'sea turtle', 'tiger', 'toucan', 'unicorn', 'vulture', 'walrus', 'whale', 'wolf', 'zebra'
    ],
    "Age": [
        'adult', 'mature', 'mature female', 'mature male', 'old', 'old man', 'old woman'
    ],
    "Hair Color": [
        'blonde hair', 'brown hair', 'black hair', 'red hair', 'white hair', 'silver hair', 'gray hair', 'blue hair', 'green hair', 'pink hair', 'purple hair', 'orange hair', 'multi-colored hair', 'gradient hair', 'streaked hair'
    ],
    "Hair Style": [
        'long hair', 'short hair', 'medium hair', 'very long hair', 'bob cut', 'pixie cut', 'ponytail', 'twintails', 'braid', 'messy hair', 'ahoge', 'hime cut', 'spiked hair', 'undercut'
    ],
    "Eye Color": [
        'blue eyes', 'green eyes', 'brown eyes', 'red eyes', 'yellow eyes', 'purple eyes', 'black eyes', 'heterochromia'
    ],
    "Body Features": [
        'large breasts', 'medium breasts', 'small breasts', 'toned', 'muscular', 'abs', 'curvy', 'skinny', 'wings', 'tail', 'horns', 'pointy ears', 'freckles', 'tan', 'pale skin', 'dark skin', 'scar', 'tattoo', 'fangs'
    ],
    "Headwear": [
        'hat', 'witch hat', 'fedora', 'beanie', 'baseball cap', 'crown', 'tiara', 'hairband', 'helmet', 'hood'
    ],
    "Eyewear": [
        'glasses', 'sunglasses', 'goggles', 'eyepatch'
    ],
    "Tops": [
        'shirt', 't-shirt', 'blouse', 'tank top', 'crop top', 'sweater', 'hoodie', 'vest', 'bra'
    ],
    "Bottoms": [
        'pants', 'jeans', 'shorts', 'skirt', 'pleated skirt', 'miniskirt', 'pantyhose', 'leggings'
    ],
    "Dresses & Suits": [
        'dress', 'sundress', 'ball gown', 'wedding dress', 'jumpsuit', 'suit', 'tuxedo'
    ],
    "Outerwear": [
        'jacket', 'coat', 'trench coat', 'cape', 'poncho', 'blazer'
    ],
    "Footwear": [
        'boots', 'thigh boots', 'heels', 'sneakers', 'sandals', 'socks', 'thighhighs'
    ],
    "Accessories": [
        'choker', 'necklace', 'earrings', 'bracelet', 'gloves', 'scarf', 'tie', 'belt', 'backpack'
    ],
    "Character Themes": [
        'maid', 'school uniform', 'sailor uniform', 'cheerleader', 'nurse', 'knight', 'warrior', 'mage', 'witch', 'pirate', 'vampire', 'cyborg', 'robot', 'detective'
    ],
    "Pose & Action": [
        'standing', 'sitting', 'lying on back', 'leaning forward', 'arms up', 'crossed arms', 'hand on hip', 'looking at viewer', 'looking away', 'waving', 'running', 'jumping', 'dancing', 'casting spell', 'holding sword', 'fighting', 'hugging'
    ],
    "Expression": [
        'smile', 'open mouth', 'laughing', 'grin', 'blush', 'frown', 'crying', 'sad', 'angry', 'shouting', 'smug', 'serious', 'surprised', 'closed eyes', 'winking'
    ],
    "Background & Environment": [
        'outdoors', 'indoors', 'forest', 'cityscape', 'dystopian city', 'night sky', 'starry sky', 'beach', 'ocean', 'mountains', 'castle', 'ruins', 'sci-fi background', 'fantasy background', 'space', 'underwater', 'simple background', 'white background'
    ],
    "Lighting": [
        'cinematic lighting', 'dramatic lighting', 'studio lighting', 'soft lighting', 'hard lighting', 'rim lighting', 'volumetric lighting', 'god rays', 'glowing', 'neon lights'
    ],
    "Camera & Angle": [
        'close-up shot', 'medium shot', 'full body shot', 'from above', 'from below', 'from side', 'dutch angle', 'wide angle', 'depth of field'
    ],
    "Art Medium": [
        'illustration', 'digital painting', 'concept art', 'sketch', 'oil painting', 'watercolor', 'cel shading', '3d render'
    ]
};


// A separate, larger list of tags curated from popular sources.
// This is used for the "Sync Community Tags" feature to simulate a live update.
export const popularCommunityTags: TagCategories = {
    "Hair Style": [
        "asymmetrical hair", "flipped hair", "hair over one eye", "wavy hair", "curly hair", "straight hair", "hair bun", "double bun", "drill hair", "sidetails", "low ponytail", "high ponytail", "hair between eyes"
    ],
    "Body Features": [
        "claws", "paws", "tentacles", "gills", "fur", "scales", "feathers", "glowing eyes", "third eye", "animal ears", "slit pupils", "no pupils"
    ],
    "Headwear": [
        "kabuto", "head-wings", "garrison cap", "nurse cap", "party hat", "ribbon", "hair flower", "hairpin", "gothic headdress", "animal ear hoodie"
    ],
    "Eyewear": [
        "blindfold", "steampunk goggles", "3d glasses", "heart-shaped eyewear"
    ],
    "Tops": [
        "collared shirt", "off-shoulder sweater", "halter top", "school swimsuit", "leotard", "bodysuit", "chinese clothes", "kimono", "yukata", "qipao", "armor"
    ],
    "Bottoms": [
        "hakama", "track shorts", "denim shorts", "boy shorts", "dolphin shorts", "sarong"
    ],
    "Dresses & Suits": [
        "apron", "gym uniform", "tracksuit", "racing suit", "pilot suit", "plugsuit", "wetsuit"
    ],
    "Outerwear": [
        "hooded jacket", "denim jacket", "leather jacket", "lab coat", "haori", "cloak"
    ],
    "Footwear": [
        "geta", "zori", "waraji", "high-top sneakers", "combat boots", "rain boots"
    ],
    "Accessories": [
        "armlet", "garter straps", "band-aid", "gas mask", "headphones", " eyepatch", "bell", "collar", "sash", "obi", "leg pouch", "holster"
    ],
    "Character Themes": [
        "miko", "nun", "priestess", "idol", "ninja", "samurai", "gymnast", "athlete", "elf", "dwarf", "halfling", "tiefling", "aasimar"
    ],
    "Pose & Action": [
        "kneeling", "crouching", "squatting", "yoga", "stretching", "finger gun", "peace sign", "v sign", "salute", "shushing", "facepalm", "armpits", "praying", "sword fighting", "archery", "swimming", "flying"
    ],
    "Expression": [
        "smirk", "leer", "tongue out", "licking lips", "drunk", "sleepy", "yawning", "nosebleed", "embarrassed", "disgusted", "thinking", "confused"
    ],
    "Background & Environment": [
        "rooftop", "alley", "subway", "train station", "airport", "shrine", "temple", "graveyard", "cyberpunk city", "steampunk city", "volcano", "desert", "tundra", "swamp", "bamboo forest", "cherry blossoms"
    ],
    "Lighting": [
        "lens flare", "crepuscular rays", "backlighting", "under-lighting", "bioluminescence", "stage lighting", "spotlight", "moonlight", "sunlight"
    ],
    "Camera & Angle": [
        "from behind", "over-the-shoulder shot", "pov", "selfie", "candid", "fisheye", "macro"
    ],
    "Art Medium": [
        "monochrome", "greyscale", "sepia", "limited palette", "cross-hatching", "pixel art", "glitch art", "ASCII art"
    ],
    "Composition": [
        'rule of thirds', 'golden ratio', 'leading lines', 'symmetry', 'asymmetrical composition', 'negative space', 'framing', 'dynamic angle'
    ],
    "Photo Effects": [
        'bokeh', 'lens flare', 'light leak', 'vignette', 'chromatic aberration', 'motion blur', 'bloom', 'tilt-shift'
    ],
    "Subject Focus": [
        'portrait', 'headshot', 'upper body', 'full body', 'cowboy shot', 'profile', 'facing viewer', 'from behind', 'detailed face', 'detailed eyes'
    ]
};