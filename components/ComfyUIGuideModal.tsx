import React from 'react';

interface ComfyUIGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GuideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2">
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <div className="space-y-3 text-text-secondary/90 text-sm leading-relaxed">{children}</div>
    </div>
);

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-bg-tertiary p-3 rounded-md text-text-primary/80 text-xs overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const ComfyUIGuideModal: React.FC<ComfyUIGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="comfy-guide-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="comfy-guide-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        ComfyUI Integration Guide
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <GuideSection title="1. What is this feature?">
                        <p>This powerful feature connects the app to your local ComfyUI instance, allowing you to combine cloud and local generation. You can:</p>
                         <ul className="list-disc list-inside space-y-2">
                            <li>Use Gemini to enhance your prompts before sending them to your local models.</li>
                            <li>Generate a base image with a powerful cloud model (like Gemini or Imagen), then send it to your ComfyUI workflow for refining, upscaling, or style transfer.</li>
                        </ul>
                    </GuideSection>
                    
                     <GuideSection title="2. Enable CORS in ComfyUI (Crucial!)">
                        <p>For security, browsers block websites from talking to local servers. You must tell ComfyUI to allow requests from this app by starting it with the <strong>--enable-cors</strong> argument.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>On Windows:</strong> Edit your <code>run_nvidia_gpu.bat</code> file. Change the line <code>call python.exe main.py</code> to:
                                <CodeBlock>call python.exe main.py --enable-cors</CodeBlock>
                            </li>
                             <li>
                                <strong>On Linux/macOS:</strong> Start ComfyUI from your terminal using:
                                <CodeBlock>python main.py --enable-cors</CodeBlock>
                            </li>
                        </ul>
                        <p>Save the file and restart ComfyUI. The "Check Connection" button should now show an "Online" status.</p>
                    </GuideSection>
                    
                    <GuideSection title="3. Understanding Workflows & Node Titles">
                        <p>This app injects your settings into your ComfyUI workflow JSON. For it to work correctly, your workflow needs specific nodes.</p>
                        <p className="p-3 bg-info-bg/50 text-info text-xs rounded-md border border-info/50">
                            For best results, <strong>title your nodes in ComfyUI</strong> before exporting the API format. The app looks for these titles:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-text-secondary/80">
                            <li><strong>"Load Image"</strong>: This is where your input image will be sent.</li>
                            <li><strong>"Load Checkpoint"</strong>: Receives the selected model checkpoint.</li>
                            <li><strong>"Positive Prompt"</strong>: Receives the text from the "Core Prompt" box.</li>
                            <li><strong>"Negative Prompt"</strong>: Receives the text from the "Negative Prompt" box.</li>
                             <li><strong>"Empty Latent Image"</strong>: This is where the batch size will be set.</li>
                        </ul>
                        <p>If titles are not found, the app will try to guess based on the node type (e.g., `CheckpointLoaderSimple`), but titling is more reliable, especially with custom nodes.</p>
                    </GuideSection>
                     <GuideSection title="4. Tips for Common Nodes">
                        <p>To ensure your workflow functions correctly with this app, here are some key nodes to include:</p>
                        <ul className="list-disc list-inside space-y-3">
                            <li><strong className="text-text-primary/90">CheckpointLoader:</strong> Your workflow needs a node to load a model (e.g., `CheckpointLoaderSimple`). The app will automatically populate this with the checkpoint you select in the UI.</li>
                            <li><strong className="text-text-primary/90">CLIPTextEncode:</strong> You need at least one of these for your positive prompt. If you have two, the app will use the second one for the negative prompt. Title them "Positive Prompt" and "Negative Prompt" for best results.</li>
                             <li><strong className="text-text-primary/90">KSampler:</strong> This is the heart of the generation process. It takes the model, prompts (conditioning), and a latent image and outputs the result.</li>
                              <li><strong className="text-text-primary/90">SaveImage:</strong> <span className="text-danger/90 font-bold">This is required!</span> The app can only receive images that are saved by a `SaveImage` or similar node at the end of your workflow. If you forget this, the process will complete but no image will appear.</li>
                        </ul>
                    </GuideSection>
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

export default ComfyUIGuideModal;