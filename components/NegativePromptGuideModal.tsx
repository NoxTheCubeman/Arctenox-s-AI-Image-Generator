import React from 'react';

interface NegativePromptGuideModalProps {
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

const NegativePromptGuideModal: React.FC<NegativePromptGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="negative-prompt-guide-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="negative-prompt-guide-title" className="text-xl font-bold text-text-primary flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        Negative Prompt Guide
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <GuideSection title="What is a Negative Prompt?">
                        <p>A negative prompt tells the AI what you <strong className="text-accent">do not</strong> want to see in the image. It's a powerful tool to refine your results, fix common errors, and steer the generation away from undesirable content.</p>
                        <p>Think of it as the opposite of your main prompt. You list keywords, comma-separated, just like in the positive prompt.</p>
                    </GuideSection>
                    
                     <GuideSection title="Improving Image Quality">
                        <p>This is the most common use case. You can remove common visual artifacts and low-quality traits.</p>
                        <p className="font-semibold">Example:</p>
                        <CodeBlock>low quality, worst quality, blurry, jpeg artifacts, compression artifacts, noisy, grainy, ugly</CodeBlock>
                    </GuideSection>
                    
                    <GuideSection title="Fixing Anatomy & Deformities">
                        <p>AI can sometimes struggle with anatomy, especially hands and limbs. Negative prompts help correct these issues.</p>
                        <p className="font-semibold">Example for fixing a person:</p>
                        <CodeBlock>malformed hands, extra fingers, missing fingers, extra limbs, missing limbs, mutated, deformed, disfigured, poorly drawn face, bad anatomy</CodeBlock>
                    </GuideSection>

                     <GuideSection title="Removing Unwanted Content">
                        <p>Use negative prompts to explicitly forbid certain objects or concepts from appearing in your image.</p>
                         <ul className="list-disc list-inside space-y-2">
                            <li>To remove signatures and text: <CodeBlock>text, watermark, signature, artist name, logo</CodeBlock></li>
                            <li>To ensure a safe-for-work image: <CodeBlock>nsfw, explicit, nudity, cleavage</CodeBlock></li>
                            <li>To remove an object: <CodeBlock>no hat, no sword, no glasses</CodeBlock></li>
                        </ul>
                    </GuideSection>
                    
                    <GuideSection title="Controlling Style">
                        <p>If the AI is generating a style you don't want (e.g., getting photos when you want anime), you can negatively prompt the unwanted style.</p>
                        <p className="font-semibold">Example to get a 2D/anime style:</p>
                        <CodeBlock>photorealistic, photography, 3d, render, realism</CodeBlock>
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

export default NegativePromptGuideModal;
