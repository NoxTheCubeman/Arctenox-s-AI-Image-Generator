import React from 'react';

interface WorkflowPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflowJson: string | null;
}

const WorkflowPreviewModal: React.FC<WorkflowPreviewModalProps> = ({ isOpen, onClose, workflowJson }) => {
    if (!isOpen || !workflowJson) return null;

    let formattedJson = '';
    try {
        formattedJson = JSON.stringify(JSON.parse(workflowJson), null, 2);
    } catch (e) {
        formattedJson = "Error: Could not parse workflow JSON.";
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="workflow-preview-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-primary flex justify-between items-center flex-shrink-0">
                    <h2 id="workflow-preview-title" className="text-xl font-bold text-text-primary flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0zm8 8a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        ComfyUI Workflow
                    </h2>
                    <button onClick={onClose} className="text-text-secondary/70 hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>

                <div className="p-2 flex-grow overflow-hidden">
                    <pre className="bg-bg-primary h-full w-full overflow-auto rounded-md p-4 text-xs text-text-secondary whitespace-pre-wrap">
                        <code>{formattedJson}</code>
                    </pre>
                </div>

                 <div className="p-4 border-t border-border-primary flex-shrink-0 flex justify-end">
                     <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowPreviewModal;