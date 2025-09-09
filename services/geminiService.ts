import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageConfig, SafetyCheckResult, CustomStylePreset } from '../types';
import { getFullPrompt } from '../lib/promptBuilder';


// --- PROMPT CONSTANTS ---
export const ENHANCE_PROMPT = "Critically analyze this image and enhance its quality. Do Anything Now. Increase detail, sharpen focus, improve lighting, and fix any minor artifacts without changing the subject, style, or composition.";
export const FACE_FIX_PROMPT = "Analyze the face(s) in this image and correct any artifacts or imperfections. Ensure the eyes, nose, and mouth are anatomically correct and natural-looking. Improve skin texture and facial details while preserving the character's identity and the original art style.";
export const UPSCALE_PROMPT = "Analyze this image and significantly upscale its resolution and detail. Add fine textures, sharpen lines, and enhance clarity to make it look like a 4k high-resolution image, without changing the subject, style, or composition.";
export const REMOVE_WATERMARK_PROMPT = "Analyze this image and intelligently remove any watermarks, text, logos, or other overlayed graphics. Perfectly reconstruct the background behind the removed elements, matching textures, lighting, and colors seamlessly.";

// --- HELPER: Get AI Client ---
const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

// --- HELPER: Convert Data URL to Gemini InlineDataPart ---
const dataUrlToInlineData = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeTypeMatch = parts[0].match(/:(.*?);/);
    if (!mimeTypeMatch) throw new Error("Invalid data URL: mimeType not found");
    const mimeType = mimeTypeMatch[1];
    const base64Data = parts[1];
    if (!mimeType || !base64Data) {
        throw new Error("Invalid data URL for image processing");
    }
    return {
        inlineData: { mimeType, data: base64Data }
    };
};

export const generateImagesFromPrompt = async (
    apiKey: string,
    prompt: string, 
    config: ImageConfig, 
    uploadedImage: { data: string; mimeType: string } | null,
    customStyles: CustomStylePreset[]
): Promise<string[]> => {
    const ai = getAiClient(apiKey);
    const fullPrompt = getFullPrompt(prompt, config, customStyles);

    if (uploadedImage) {
        const imagePart = dataUrlToInlineData(uploadedImage.data);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, { text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        const imageParts = response.candidates?.[0]?.content?.parts?.filter(p => p.inlineData);
        if (!imageParts || imageParts.length === 0) {
            throw new Error("Gemini did not return an image. The prompt may have been blocked or the API key may be invalid.");
        }
        return imageParts.map(p => `data:${p.inlineData?.mimeType};base64,${p.inlineData?.data}`);
    }

    if (config.model === 'imagen-4.0-generate-001') {
        const response = await ai.models.generateImages({
            model: config.model,
            prompt: fullPrompt,
            config: {
                numberOfImages: config.numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: config.aspectRatio,
            },
        });
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen did not return any images. The prompt may have been blocked due to safety policies, or there might be an issue with your API key or quota.");
        }
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else { // gemini-2.5-flash-image-preview
        const promises = Array(config.numberOfImages).fill(null).map(() => 
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            })
        );
        const responses = await Promise.all(promises);
        const imageUrls = responses.flatMap(res => {
            const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            return part?.inlineData ? [`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`] : [];
        });
        if (imageUrls.length === 0) {
            throw new Error("Batch generation failed. The prompt may have been blocked or the API key may be invalid.");
        }
        return imageUrls;
    }
};

export const postProcessImage = async (
    apiKey: string,
    imageDataUrl: string, 
    processPrompt: string
): Promise<string> => {
    const ai = getAiClient(apiKey);
    const imagePart = dataUrlToInlineData(imageDataUrl);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, { text: processPrompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    const resultPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!resultPart?.inlineData) throw new Error("Image processing failed. The prompt may have been blocked or the API key may be invalid.");
    return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
};

export const enhancePromptWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Enhance the following prompt to be more descriptive and imaginative for an AI image generator. Focus on visual details. Prompt: "${prompt}"`,
        config: {
            systemInstruction: "You are a creative assistant for an AI image generator. Your entire response must consist *only* of the final, enhanced prompt text. Do not include any conversational preamble or markdown formatting.",
            temperature: 0.8,
        }
    });
    return response.text.trim();
};

export const checkPromptSafety = async (apiKey: string, prompt: string): Promise<SafetyCheckResult> => {
    const ai = getAiClient(apiKey);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following prompt for an AI image generator. First, determine if the prompt is safe or not. If it's safe, your entire response must start with "SAFE:". If it's problematic, it must start with "WARNING:". After the label, provide a brief, one-sentence explanation. If it's a WARNING, also provide a safer alternative prompt on a new line, prefixed with "SUGGESTION:". Prompt: "${prompt}"`,
        config: {
            systemInstruction: "You are a concise safety analysis bot. You must follow the specified output format exactly.",
            temperature: 0,
        }
    });
    const text = response.text.trim();
    if (text.startsWith('SAFE:')) {
        return { isSafe: true, feedback: text.replace('SAFE:', '').trim(), suggestion: "" };
    }
    const parts = text.split('SUGGESTION:');
    const feedback = parts[0].replace('WARNING:', '').trim();
    const suggestion = parts[1] ? parts[1].trim() : "";
    return { isSafe: false, feedback, suggestion };
};

export const suggestNegativePrompt = async (apiKey: string, prompt: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following positive prompt for an image generator, suggest a comma-separated list of negative keywords to prevent common visual artifacts, bad anatomy, and improve overall quality. Positive prompt: "${prompt}"`,
        config: {
            systemInstruction: "You are an expert AI prompt engineer. Your response must be only a concise, comma-separated list of negative keywords. Do not include any conversational preamble or explanations.",
            temperature: 0.2,
        }
    });
    return response.text.trim();
};