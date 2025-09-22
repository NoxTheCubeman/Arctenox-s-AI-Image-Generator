// services/comfyuiService.ts

import type { LoRA } from '../types';

// A new, simple text-to-image workflow without any LoRA loaders.
export const DEFAULT_T2I_SIMPLE_WORKFLOW_API = `{
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler",
    "_meta": { "title": "KSampler" }
  },
  "4": {
    "inputs": { "ckpt_name": "v1-5-pruned-emaonly-fp16.safetensors" },
    "class_type": "CheckpointLoaderSimple",
    "_meta": { "title": "Load Checkpoint" }
  },
  "5": {
    "inputs": { "width": 1024, "height": 1024, "batch_size": 1 },
    "class_type": "EmptyLatentImage",
    "_meta": { "title": "Empty Latent Image" }
  },
  "6": {
    "inputs": { "text": "", "clip": ["4", 1] },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "Positive Prompt" }
  },
  "7": {
    "inputs": { "text": "", "clip": ["4", 1] },
    "class_type": "CLIPTextEncode",
    "_meta": { "title": "Negative Prompt" }
  },
  "8": {
    "inputs": { "samples": ["3", 0], "vae": ["4", 2] },
    "class_type": "VAEDecode",
    "_meta": { "title": "VAE Decode" }
  },
  "9": {
    "inputs": { "filename_prefix": "ComfyUI", "images": ["8", 0] },
    "class_type": "SaveImage",
    "_meta": { "title": "Save Image" }
  }
}`;

// A default text-to-image workflow with a standard LoraLoader.
export const DEFAULT_T2I_SINGLE_LORA_WORKFLOW_API = `{
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": [
        "11",
        0
      ],
      "positive": [
        "6",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly-fp16.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 1024,
      "height": 1024,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "",
      "clip": [
        "11",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "7": {
    "inputs": {
      "text": "",
      "clip": [
        "11",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  },
  "11": {
    "inputs": {
      "lora_name": "anastasia_blackwell_-_main_oc_6-000010.safetensors",
      "strength_model": 1,
      "strength_clip": 1,
      "model": [
        "4",
        0
      ],
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "LoraLoader",
    "_meta": {
      "title": "Load LoRA"
    }
  }
}`;

// A default text-to-image workflow using rgthree's Power Lora Loader.
export const DEFAULT_T2I_WORKFLOW_API = `{
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": [
        "10",
        0
      ],
      "positive": [
        "6",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly-fp16.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 1024,
      "height": 1024,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "",
      "clip": [
        "10",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "Positive Prompt"
    }
  },
  "7": {
    "inputs": {
      "text": "",
      "clip": [
        "10",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "Negative Prompt"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  },
  "10": {
    "inputs": {
      "lora_name_1": "None",
      "strength_model_1": 1,
      "strength_clip_1": 1,
      "model": [
        "4",
        0
      ],
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "Power Lora Loader (rgthree)",
    "_meta": {
      "title": "Power Lora Loader"
    }
  }
}`;

// A default image-to-image workflow.
export const DEFAULT_I2I_WORKFLOW_API = `{
  "3": {
    "inputs": {
      "seed": 855834114228544,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 0.8,
      "model": [
        "4",
        0
      ],
      "positive": [
        "6",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "11",
        0
      ]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "6": {
    "inputs": {
      "text": "masterpiece, best quality, a beautiful painting of a cat",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "Positive Prompt"
    }
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "Negative Prompt"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  },
  "10": {
    "inputs": {
      "image": "example.png",
      "upload": "image"
    },
    "class_type": "LoadImage",
    "_meta": {
      "title": "Load Image"
    }
  },
  "11": {
    "inputs": {
      "pixels": [
        "10",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEEncode",
    "_meta": {
      "title": "VAE Encode"
    }
  }
}`;


// Helper to convert data URL to Blob
const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL: could not find MIME type.');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};


export const checkServerStatus = async (address: string): Promise<boolean> => {
    try {
        const response = await fetch(address, { mode: 'cors' });
        return response.ok;
    } catch (e) {
        console.error("ComfyUI server check failed:", e);
        throw new Error("Server not reachable.");
    }
};

export const getCheckpoints = async (address: string): Promise<string[]> => {
    try {
        const response = await fetch(`${address}/object_info`, { mode: 'cors' });
        if (!response.ok) throw new Error("Failed to fetch object info.");
        const data = await response.json();
        const checkpoints = data?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0];
        if (!Array.isArray(checkpoints)) {
            throw new Error("Could not find checkpoints list in CheckpointLoaderSimple node info.");
        }
        return checkpoints;
    } catch (e) {
        console.error("Failed to get checkpoints:", e);
        throw new Error("Could not fetch models from ComfyUI.");
    }
};

export const getLoras = async (address: string): Promise<string[]> => {
    try {
        const response = await fetch(`${address}/object_info`, { mode: 'cors' });
        if (!response.ok) throw new Error("Failed to fetch object info for LoRAs.");
        const data = await response.json();
        const loraLoaderInfo = Object.values(data).find((nodeInfo: any) => 
            nodeInfo?.input?.required?.lora_name
        ) as any;
        
        const loras = loraLoaderInfo?.input?.required?.lora_name?.[0];

        if (!Array.isArray(loras)) {
            console.warn("Could not find LoRAs list automatically. Your ComfyUI setup might be different.");
            return [];
        }
        return loras;
    } catch (e) {
        console.error("Failed to get LoRAs:", e);
        throw new Error("Could not fetch LoRAs from ComfyUI.");
    }
};


export const uploadImage = async (address: string, imageDataUrl: string, filename: string): Promise<string> => {
    try {
        const blob = dataURLToBlob(imageDataUrl);
        const formData = new FormData();
        formData.append('image', blob, filename);
        formData.append('overwrite', 'true');

        const response = await fetch(`${address}/upload/image`, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to upload image. Status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.name) {
            throw new Error('Image uploaded, but server did not return a filename.');
        }
        return data.name;
    } catch (e) {
        console.error("Failed to upload image to ComfyUI:", e);
        throw e;
    }
};

export interface WorkflowAnalysis {
    hasRgthreeLoader: boolean;
    loraLoaderNodeIds: string[];
}

export const analyzeWorkflow = (workflowJson: string): WorkflowAnalysis => {
    try {
        const workflow = JSON.parse(workflowJson);
        const analysis: WorkflowAnalysis = {
            hasRgthreeLoader: false,
            loraLoaderNodeIds: [],
        };
        const nodeIds = Object.keys(workflow);
        for (const id of nodeIds) {
            const node = workflow[id];
            if (node.class_type === 'Power Lora Loader (rgthree)') {
                analysis.hasRgthreeLoader = true;
            }
            if (node.class_type === 'LoraLoader') {
                analysis.loraLoaderNodeIds.push(id);
            }
        }
        // Sort node IDs numerically to ensure consistent order
        analysis.loraLoaderNodeIds.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        return analysis;
    } catch (e) {
        console.error("Failed to parse or analyze workflow:", e);
        return { hasRgthreeLoader: false, loraLoaderNodeIds: [] };
    }
};


export const queuePromptInBackground = async (
    address: string,
    workflowApi: string,
    prompt: string,
    negativePrompt: string,
    checkpoint: string,
    batchSize: number,
    width: number,
    height: number,
    seed: number,
    loras: LoRA[],
    cfg: number,
    steps: number,
    samplerName: string,
    scheduler: string
): Promise<void> => {
    try {
        const workflow = JSON.parse(workflowApi);
        const analysis = analyzeWorkflow(workflowApi);
        
        // --- Find key nodes by title or type (fallback) ---
        let positivePromptNodeId: string | null = null;
        let negativePromptNodeId: string | null = null;
        let checkpointNodeId: string | null = null;
        let latentImageNodeId: string | null = null;
        const clipTextEncodeNodes: string[] = [];

        for (const id in workflow) {
            const node = workflow[id];
            if (node._meta?.title?.toLowerCase().includes('positive')) positivePromptNodeId = id;
            if (node._meta?.title?.toLowerCase().includes('negative')) negativePromptNodeId = id;
            if (node._meta?.title?.toLowerCase().includes('checkpoint')) checkpointNodeId = id;
            if (node._meta?.title?.toLowerCase().includes('latent')) latentImageNodeId = id;
            if (node.class_type === 'CLIPTextEncode') clipTextEncodeNodes.push(id);
        }

        if (!checkpointNodeId) checkpointNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'CheckpointLoaderSimple') || null;
        if (!positivePromptNodeId && clipTextEncodeNodes.length > 0) positivePromptNodeId = clipTextEncodeNodes[0];
        if (!negativePromptNodeId && clipTextEncodeNodes.length > 1) negativePromptNodeId = clipTextEncodeNodes[1];
        if (!latentImageNodeId) latentImageNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'EmptyLatentImage') || null;
        
        if (!checkpointNodeId) throw new Error("Could not find a 'Load Checkpoint' (CheckpointLoaderSimple) node in the workflow.");

        // --- Handle LoRAs ---
        if (analysis.hasRgthreeLoader) {
            const powerLoraLoaderNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'Power Lora Loader (rgthree)');
            if (powerLoraLoaderNodeId) {
                const loraList = loras
                    .filter(lora => lora.name)
                    .map(lora => [lora.name, lora.strength, lora.strength]);
                workflow[powerLoraLoaderNodeId].inputs.loras = loraList;
            }
        } else if (analysis.loraLoaderNodeIds.length > 0) {
            analysis.loraLoaderNodeIds.forEach((nodeId, index) => {
                const loraConfig = loras[index];
                if (loraConfig && loraConfig.name) {
                    const node = workflow[nodeId];
                    if (node) {
                        node.inputs.lora_name = loraConfig.name;
                        node.inputs.strength_model = loraConfig.strength;
                        node.inputs.strength_clip = loraConfig.strength;
                    }
                }
            });
        }
        
        // --- Update basic generation parameters ---
        let seedUpdated = false;
        let stepsUpdated = false;
        let cfgUpdated = false;
        let samplerUpdated = false;
        let schedulerUpdated = false;

        for (const id in workflow) {
            const node = workflow[id];
            if (node.inputs) {
                if ('seed' in node.inputs) {
                    node.inputs.seed = seed;
                    seedUpdated = true;
                }
                if ('steps' in node.inputs) {
                    node.inputs.steps = steps;
                    stepsUpdated = true;
                }
                if ('cfg' in node.inputs) {
                    node.inputs.cfg = cfg;
                    cfgUpdated = true;
                }
                if ('sampler_name' in node.inputs) {
                    node.inputs.sampler_name = samplerName;
                    samplerUpdated = true;
                }
                if ('scheduler' in node.inputs) {
                    node.inputs.scheduler = scheduler;
                    schedulerUpdated = true;
                }
            }
        }

        // More specific warnings for debugging user workflows
        if (!seedUpdated) console.warn("Could not find a 'seed' input in any KSampler-like node.");
        if (!stepsUpdated) console.warn("Could not find a 'steps' input in any KSampler-like node.");
        if (!cfgUpdated) console.warn("Could not find a 'cfg' input in any KSampler-like node.");
        if (!samplerUpdated) console.warn("Could not find a 'sampler_name' input in any KSampler-like node.");
        if (!schedulerUpdated) console.warn("Could not find a 'scheduler' input in any KSampler-like node.");

        if (checkpoint) workflow[checkpointNodeId].inputs.ckpt_name = checkpoint;

        if (positivePromptNodeId) {
            workflow[positivePromptNodeId].inputs.text = prompt;
        } else {
            throw new Error("Could not find a 'Positive Prompt' node (CLIPTextEncode) in the workflow.");
        }
        
        if (negativePromptNodeId) workflow[negativePromptNodeId].inputs.text = negativePrompt;
        
        if (latentImageNodeId) {
            workflow[latentImageNodeId].inputs.batch_size = batchSize;
            workflow[latentImageNodeId].inputs.width = width;
            workflow[latentImageNodeId].inputs.height = height;
        } else {
             console.warn("Could not find an 'Empty Latent Image' node. Batch size and resolution will not be changed.");
        }
        
        const body = JSON.stringify({ prompt: workflow });
        
        const response = await fetch(`${address}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ComfyUI Error: ${errorText}`);
        }

    } catch (e) {
        console.error("Failed to queue prompt:", e);
        if (e instanceof SyntaxError) throw new Error("Invalid Workflow API JSON. Please check the format.");
        throw e;
    }
};

export interface ComfyUISyncedImage {
    imageDataUrl: string;
    prompt: string;
    workflowJson: string;
    filename: string;
}

export const fetchRecentImages = async (address: string): Promise<ComfyUISyncedImage[]> => {
    try {
        const historyResponse = await fetch(`${address}/history`, { mode: 'cors' });
        if (!historyResponse.ok) throw new Error("Failed to fetch ComfyUI history.");
        const history = await historyResponse.json();
        
        const promptIds = Object.keys(history);
        if (promptIds.length === 0) return [];
        
        const serverUrl = new URL(address);
        const recentImageData: ComfyUISyncedImage[] = [];
        const seenFilenames = new Set();
        const maxImagesToSync = 5;

        for (const promptId of promptIds) {
            if (recentImageData.length >= maxImagesToSync) break;

            const entry = history[promptId];
            const outputs = entry.outputs;
            if (!outputs) continue;

            const workflowJson = JSON.stringify(entry.prompt[2], null, 2);
            let positivePromptText = 'Generated from ComfyUI';

            try {
                 const workflow = entry.prompt[2];
                 const positivePromptNode = Object.values(workflow).find((node: any) => node._meta?.title === 'Positive Prompt' || node.class_type === 'CLIPTextEncode') as any;
                 if (positivePromptNode) {
                    positivePromptText = positivePromptNode.inputs.text;
                 }
            } catch {}

            for (const nodeId in outputs) {
                if (outputs[nodeId].images) {
                    for (const imageInfo of outputs[nodeId].images) {
                        if (seenFilenames.has(imageInfo.filename)) continue;

                        const { filename, subfolder, type } = imageInfo;
                        const imageUrl = `${serverUrl.protocol}//${serverUrl.host}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;

                        const imageResponse = await fetch(imageUrl);
                        if (!imageResponse.ok) {
                            console.warn(`Skipping missing image file: ${filename}`);
                            continue;
                        }

                        const blob = await imageResponse.blob();
                        const imageDataUrl = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        recentImageData.push({
                            imageDataUrl,
                            prompt: positivePromptText,
                            workflowJson,
                            filename,
                        });
                        seenFilenames.add(filename);
                        if (recentImageData.length >= maxImagesToSync) break;
                    }
                }
                 if (recentImageData.length >= maxImagesToSync) break;
            }
        }
        
        return recentImageData;

    } catch (e) {
        console.error("Failed to fetch recent images from ComfyUI:", e);
        throw e instanceof Error ? e : new Error("An unknown error occurred while syncing images.");
    }
};

// Helper to get image dimensions from a data URL
const getImageDimensions = (dataUrl: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error("Could not load image to get dimensions."));
        };
        img.src = dataUrl;
    });
};

/**
 * Uploads an image to ComfyUI and prepares the JSON for a 'LoadImage' node.
 * @param address The ComfyUI server address.
 * @param imageDataUrl The data URL of the image to upload.
 * @returns A stringified JSON object for the ComfyUI graph node.
 */
export const uploadAndPrepareNodeData = async (address: string, imageDataUrl: string): Promise<string> => {
    try {
        const uniqueFilename = `app-upload-${Date.now()}.png`;
        const uploadedFilename = await uploadImage(address, imageDataUrl, uniqueFilename);
        const { width, height } = await getImageDimensions(imageDataUrl);
        
        const node = {
            id: Math.floor(Math.random() * 100000) + 1, // A random ID
            type: "LoadImage",
            pos: [0, 0], // Position on canvas, user can move it
            size: { "0": width, "1": height + 80 }, // Base size on image, add some height for widgets
            flags: {},
            order: 0,
            mode: 0,
            inputs: [],
            outputs: [
                { name: "IMAGE", type: "IMAGE", links: null },
                { name: "MASK", type: "MASK", links: null }
            ],
            properties: { "Node name for S&R": "LoadImage" },
            widgets_values: [uploadedFilename]
        };

        const graph = {
            version: 0.4,
            nodes: [node]
        };
        
        return JSON.stringify(graph);

    } catch (e) {
        console.error("Failed to upload image and prepare node:", e);
        if (e instanceof Error && e.message.includes('Failed to upload image')) {
            throw new Error("Could not upload image to ComfyUI. Check the server connection and console.");
        }
        throw new Error("Failed to prepare ComfyUI node data.");
    }
};