// services/comfyuiService.ts

// A default text-to-image workflow to pre-populate the text area.
export const DEFAULT_T2I_WORKFLOW_API = `{
  "3": {
    "inputs": {
      "seed": 156683808981188,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
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
      "ckpt_name": "v1-5-pruned-emaonly.safetensors"
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
      "text": "masterpiece, best quality, a beautiful painting",
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

interface ExtraData {
  imageName?: string;
  maskName?: string;
}

const queuePrompt = async (
    address: string,
    workflowApi: string,
    prompt: string,
    negativePrompt: string,
    checkpoint: string,
    batchSize: number,
    extraData: ExtraData = {}
): Promise<{ prompt_id: string }> => {
    try {
        const workflow = JSON.parse(workflowApi);

        // Find nodes by title first
        let positivePromptNodeId: string | null = null;
        let negativePromptNodeId: string | null = null;
        let checkpointNodeId: string | null = null;
        let imageNodeId: string | null = null;
        let maskNodeId: string | null = null;
        let batchNodeId: string | null = null;

        const clipTextEncodeNodes: string[] = [];

        for (const id in workflow) {
            const node = workflow[id];
            if (node._meta?.title === 'Positive Prompt') positivePromptNodeId = id;
            if (node._meta?.title === 'Negative Prompt') negativePromptNodeId = id;
            if (node._meta?.title === 'Load Checkpoint') checkpointNodeId = id;
            if (node._meta?.title === 'Load Image') imageNodeId = id;
            if (node._meta?.title === 'Load Image Mask') maskNodeId = id;
            if (node._meta?.title === 'Empty Latent Image') batchNodeId = id;
            if (node.class_type === 'CLIPTextEncode') clipTextEncodeNodes.push(id);
        }

        // Fallback to class_type if titles are not found
        if (!checkpointNodeId) checkpointNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'CheckpointLoaderSimple') || null;
        if (!positivePromptNodeId && clipTextEncodeNodes.length > 0) positivePromptNodeId = clipTextEncodeNodes[0];
        if (!negativePromptNodeId && clipTextEncodeNodes.length > 1) negativePromptNodeId = clipTextEncodeNodes[1];
        if (!imageNodeId) imageNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'LoadImage') || null;
        if (!maskNodeId) maskNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'LoadImage') || null;
        if (!batchNodeId) batchNodeId = Object.keys(workflow).find(id => workflow[id].class_type === 'EmptyLatentImage') || null;

        // Modify the workflow
        if (checkpointNodeId && checkpoint) workflow[checkpointNodeId].inputs.ckpt_name = checkpoint;
        if (positivePromptNodeId) workflow[positivePromptNodeId].inputs.text = prompt;
        else throw new Error("Could not find a 'Positive Prompt' node (CLIPTextEncode) in the workflow.");
        if (negativePromptNodeId) workflow[negativePromptNodeId].inputs.text = negativePrompt;
        if (extraData.imageName && imageNodeId) workflow[imageNodeId].inputs.image = extraData.imageName;
        if (extraData.maskName && maskNodeId) workflow[maskNodeId].inputs.image = extraData.maskName;
        if (batchNodeId && batchSize > 0) workflow[batchNodeId].inputs.batch_size = batchSize;
        
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

        return await response.json();

    } catch (e) {
        console.error("Failed to queue prompt:", e);
        if (e instanceof SyntaxError) throw new Error("Invalid Workflow API JSON. Please check the format.");
        throw e;
    }
};

export interface ComfyUIStatus {
    message: string;
    progress?: { value: number; max: number };
}

export const executePrompt = (
    address: string,
    workflowApi: string,
    prompt: string,
    negativePrompt: string,
    checkpoint: string,
    batchSize: number,
    extraData: ExtraData,
    callbacks: {
        onStatus: (status: ComfyUIStatus) => void;
        onSuccess: (images: string[]) => void;
        onError: (error: Error) => void;
    }
): { close: () => void } => {
    const clientId = crypto.randomUUID();
    let ws: WebSocket | null = null;
    let serverUrl: URL;

    try {
        serverUrl = new URL(address);
    } catch (e) {
        callbacks.onError(new Error("Invalid server address provided."));
        return { close: () => {} };
    }

    const connectWebSocket = (promptId: string) => {
        callbacks.onStatus({ message: 'Connecting to WebSocket...' });
        const wsProtocol = serverUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${wsProtocol}//${serverUrl.host}/ws?clientId=${clientId}`);

        ws.onopen = () => callbacks.onStatus({ message: 'WebSocket connected. Waiting for prompt execution...' });
        
        ws.onmessage = async (event) => {
            if (typeof event.data !== 'string') return;
            const msg = JSON.parse(event.data);
            
            const messageType = msg.type;
            const isFinalMessage = (messageType === 'executed' || messageType === 'execution_cached') && msg.data.prompt_id === promptId;

            if (messageType === 'status') {
                 const queueRemaining = msg.data?.status?.exec_info?.queue_remaining;
                 if (queueRemaining !== undefined && queueRemaining > 0) callbacks.onStatus({ message: `Info: Queue remaining: ${queueRemaining}`});
            } else if (messageType === 'progress') {
                callbacks.onStatus({ message: `Executing node...`, progress: { value: msg.data.value, max: msg.data.max } });
            } else if (isFinalMessage) {
                const outputs = msg.data.output;
                let allImages: any[] = [];

                if (outputs) {
                    for (const nodeId in outputs) {
                        if (outputs[nodeId]?.images) allImages = allImages.concat(outputs[nodeId].images);
                    }
                }

                if (allImages.length > 0) {
                    callbacks.onStatus({ message: 'Execution complete. Fetching images...' });
                    try {
                        const fetchedImages = await Promise.all(allImages.map(async (output: any) => {
                            const imageUrl = `${serverUrl.protocol}//${serverUrl.host}/view?filename=${encodeURIComponent(output.filename)}&subfolder=${encodeURIComponent(output.subfolder)}&type=${encodeURIComponent(output.type)}`;
                            const response = await fetch(imageUrl);
                            if (!response.ok) throw new Error(`Failed to fetch image: ${output.filename}`);
                            const blob = await response.blob();
                            return new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsDataURL(blob);
                            });
                        }));
                        callbacks.onSuccess(fetchedImages);
                    } catch(e) {
                         callbacks.onError(e instanceof Error ? e : new Error(`Failed to fetch a generated image.`));
                    } finally {
                        ws?.close();
                    }
                } else {
                    callbacks.onError(new Error("Workflow executed successfully, but no image was saved. Please ensure your workflow includes a 'Save Image' node."));
                    ws?.close();
                }
            } else if (messageType === 'execution_error') {
                 callbacks.onError(new Error(`Execution Error: ${JSON.stringify(msg.data.exception_message)}`));
                 ws?.close();
            }
        };
        
        ws.onerror = (event) => {
            callbacks.onError(new Error('WebSocket error occurred. Check server connection and CORS settings.'));
            console.error('WebSocket Error:', event);
        };
    };

    (async () => {
        try {
            callbacks.onStatus({ message: 'Queueing prompt via HTTP...' });
            const response = await queuePrompt(address, workflowApi, prompt, negativePrompt, checkpoint, batchSize, extraData);
            connectWebSocket(response.prompt_id);
        } catch (e) {
            callbacks.onError(e instanceof Error ? e : new Error('An unknown error occurred during queuing.'));
        }
    })();
    
    return {
        close: () => {
            if (ws && ws.readyState === WebSocket.OPEN) ws.close();
        }
    };
};

export const fetchLatestImage = async (address: string): Promise<string> => {
    try {
        const historyResponse = await fetch(`${address}/history`, { mode: 'cors' });
        if (!historyResponse.ok) throw new Error("Failed to fetch ComfyUI history.");
        const history = await historyResponse.json();
        
        const promptIds = Object.keys(history);
        if (promptIds.length === 0) throw new Error("No recent images found in ComfyUI history.");

        const latestPrompt = history[promptIds[0]];
        const outputs = latestPrompt.outputs;
        if (!outputs) throw new Error("Latest history entry has no outputs.");

        let latestImageInfo = null;
        for (const nodeId in outputs) {
            if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
                latestImageInfo = outputs[nodeId].images[outputs[nodeId].images.length - 1];
                break;
            }
        }

        if (!latestImageInfo) throw new Error("Could not find an image in the latest ComfyUI history entry.");

        const { filename, subfolder, type } = latestImageInfo;
        const serverUrl = new URL(address);
        const imageUrl = `${serverUrl.protocol}//${serverUrl.host}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Failed to fetch image file: ${filename}`);

        const blob = await imageResponse.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (e) {
        console.error("Failed to fetch latest image from ComfyUI:", e);
        throw e;
    }
};