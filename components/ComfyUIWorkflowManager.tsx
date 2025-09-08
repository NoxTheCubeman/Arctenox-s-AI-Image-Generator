import React, { useState, useEffect, useRef } from 'react';
import type { ComfyUIWorkflowPreset } from '../types';

interface ComfyUIWorkflowManagerProps {
    isOpen: boolean;
    onClose: () => void;
    workflows: ComfyUIWorkflowPreset[];
    onSave: (workflow: ComfyUIWorkflowPreset) => void;
    onDelete: (id: string) => void;
}

const ComfyUIWorkflowManager: React.FC<ComfyUIWorkflowManagerProps> = ({ isOpen, onClose, workflows, onSave, onDelete }) => {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [json, setJson] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to sync the form state to the selected workflow
    useEffect(() => {
        if (selectedWorkflowId) {
            const selected = workflows.find(w => w.id === selectedWorkflowId);
            if (selected) {
                setName(selected.name);
                setJson(selected.workflowJson);
            }
        }
        // When selectedWorkflowId is null, we are in "new" mode.
        // We don't clear the form here because it might have been populated by an import.
        // Clearing is an explicit action in handleNewWorkflow.
    }, [selectedWorkflowId, workflows]);

    // Effect to handle the initial state when the modal opens or when the list changes
    useEffect(() => {
        if (isOpen) {
            const selectionIsValid = selectedWorkflowId && workflows.some(w => w.id === selectedWorkflowId);
            if (!selectionIsValid) {
                // If there's no valid selection (e.g., on first open or after deletion),
                // default to the first item or enter 'new' mode.
                if (workflows.length > 0) {
                    setSelectedWorkflowId(workflows[0].id);
                } else {
                    // No workflows exist, so enter 'new' mode.
                    setSelectedWorkflowId(null);
                    setName('');
                    setJson('');
                }
            }
        }
    }, [isOpen, workflows]);

    const handleSelectWorkflow = (workflow: ComfyUIWorkflowPreset) => {
        setSelectedWorkflowId(workflow.id);
    };

    const handleNewWorkflow = () => {
        setSelectedWorkflowId(null);
        setName('');
        setJson('');
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                // Validate that the content is valid JSON
                JSON.parse(content);
                
                // Set state to 'creating new' to prepare for saving
                setSelectedWorkflowId(null);

                // Populate the form fields
                setName(file.name.replace(/\.json$/, '')); // Use filename as name
                setJson(content);
                
            } catch (error) {
                alert(`Error: The selected file is not valid JSON. ${(error as Error).message}`);
            }
        };
        reader.onerror = () => {
            alert('An error occurred while reading the file.');
        };
        reader.readAsText(file);

        // Clear the input value so the same file can be selected again
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleExport = () => {
        if (!json || !name) return;

        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Sanitize the name for use in a filename
        const fileName = `${name.replace(/ /g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("Workflow name cannot be empty.");
            return;
        }
        try {
            JSON.parse(json);
        } catch (e) {
            alert("Invalid JSON format in workflow.");
            return;
        }

        const isNew = !selectedWorkflowId;
        const workflow: ComfyUIWorkflowPreset = {
            id: selectedWorkflowId || crypto.randomUUID(),
            name: name.trim(),
            workflowJson: json,
        };
        onSave(workflow);
        if (isNew) {
            // After saving, immediately select the new workflow by its ID.
            // This transitions from 'new' mode to 'edit' mode.
            setSelectedWorkflowId(workflow.id);
        }
    };
    
    const isDefault = selectedWorkflowId?.startsWith('default-');
    const isNew = !selectedWorkflowId;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="workflow-manager-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <h2 id="workflow-manager-title" className="text-xl font-bold text-text-primary p-4 border-b border-border-primary flex-shrink-0">ComfyUI Workflow Manager</h2>
                
                <div className="flex flex-grow overflow-hidden">
                    {/* Left Panel: Workflow List */}
                    <div className="w-1/3 border-r border-border-primary flex flex-col">
                        <div className="p-4 flex-shrink-0">
                            <button onClick={handleNewWorkflow} className="w-full px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover transition-colors">
                                + Create New Workflow
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {workflows.map(wf => (
                                <div 
                                    key={wf.id} 
                                    className={`p-2 rounded-md flex justify-between items-center cursor-pointer ${selectedWorkflowId === wf.id ? 'bg-accent/30' : 'hover:bg-bg-tertiary'}`} 
                                    onClick={() => handleSelectWorkflow(wf)}
                                >
                                    <span className="font-medium text-text-primary truncate mr-2" title={wf.name}>{wf.name}</span>
                                    {!wf.id.startsWith('default-') && (
                                         <button onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }} className="text-danger/80 hover:text-danger transition-colors" aria-label={`Delete ${wf.name} workflow`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Editor */}
                    <div className="w-2/3 flex-grow p-6 space-y-4 flex flex-col">
                         {isDefault && (
                             <div className="p-3 bg-bg-tertiary border border-border-primary rounded-md text-text-secondary text-sm flex-shrink-0">
                                This is a default workflow. You cannot edit or delete it. To customize it, create a new workflow and copy this JSON as a starting point.
                             </div>
                         )}
                         <div className="flex justify-end -mb-2 gap-4">
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileImport}
                                accept=".json,application/json"
                                className="hidden"
                            />
                            <button
                                onClick={handleExport}
                                disabled={!selectedWorkflowId}
                                className="text-sm font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1 disabled:text-text-secondary/50 disabled:cursor-not-allowed"
                                title="Export this workflow to a JSON file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
                                Export to File
                            </button>
                            <button
                                onClick={handleImportClick}
                                className="text-sm font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-1"
                                title="Import a workflow from a JSON file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Import from File
                            </button>
                         </div>
                        <div>
                            <label htmlFor="workflow-name" className="block text-sm font-medium text-text-secondary mb-1">Workflow Name</label>
                            <input
                                id="workflow-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Awesome Workflow"
                                className="w-full p-2 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent"
                                disabled={isDefault}
                            />
                        </div>
                        <div className="flex flex-col flex-grow">
                             <label htmlFor="workflow-json" className="block text-sm font-medium text-text-secondary mb-1">Workflow API JSON</label>
                             <textarea
                                id="workflow-json"
                                value={json}
                                onChange={(e) => setJson(e.target.value)}
                                placeholder='Paste your ComfyUI "API Format" JSON here.'
                                className="w-full h-full p-3 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70 focus:ring-2 focus:ring-accent resize-none font-mono text-xs"
                                disabled={isDefault}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t border-border-primary mt-auto flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors">
                        Close
                    </button>
                    <button onClick={handleSave} disabled={!name.trim() || !json.trim() || isDefault} className="px-6 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed transition-colors">
                        {isNew ? 'Save New Workflow' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComfyUIWorkflowManager;