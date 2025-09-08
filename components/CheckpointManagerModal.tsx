import React, { useState, useMemo } from 'react';

interface CheckpointManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    allCheckpoints: string[];
    hiddenCheckpoints: string[];
    onUpdateHiddenCheckpoints: (updater: (current: string[]) => string[]) => void;
}

const CheckpointList: React.FC<{
    title: string;
    checkpoints: string[];
    selected: string[];
    onToggleSelect: (checkpoint: string) => void;
    onToggleSelectAll: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    isAllSelected: boolean;
}> = ({ title, checkpoints, selected, onToggleSelect, onToggleSelectAll, searchTerm, onSearchChange, isAllSelected }) => {
    return (
        <div className="bg-bg-primary/50 p-4 rounded-lg flex flex-col h-full">
            <h3 className="font-bold text-text-primary mb-2">{title} ({checkpoints.length})</h3>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full p-2 mb-2 bg-input-bg border border-input-border rounded-md text-input-text placeholder-input-placeholder/70"
            />
            <div className="mb-2 border-b border-border-primary pb-2">
                <label className="flex items-center text-sm text-text-secondary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={onToggleSelectAll}
                        className="h-4 w-4 rounded bg-bg-tertiary border-border-primary text-accent focus:ring-accent"
                    />
                    <span className="ml-2">Select All Visible</span>
                </label>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {checkpoints.length === 0 ? (
                    <p className="text-sm text-text-secondary/70 text-center pt-4">None</p>
                ) : (
                    checkpoints.map(cp => (
                        <label key={cp} className="flex items-center p-2 rounded-md hover:bg-bg-tertiary cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(cp)}
                                onChange={() => onToggleSelect(cp)}
                                className="h-4 w-4 rounded bg-bg-tertiary border-border-primary text-accent focus:ring-accent"
                            />
                            <span className="ml-3 text-sm text-text-primary truncate" title={cp}>{cp}</span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
};

const CheckpointManagerModal: React.FC<CheckpointManagerModalProps> = ({ isOpen, onClose, allCheckpoints, hiddenCheckpoints, onUpdateHiddenCheckpoints }) => {
    const [selectedVisible, setSelectedVisible] = useState<string[]>([]);
    const [selectedHidden, setSelectedHidden] = useState<string[]>([]);
    const [visibleSearch, setVisibleSearch] = useState('');
    const [hiddenSearch, setHiddenSearch] = useState('');

    const visibleCheckpoints = useMemo(() =>
        allCheckpoints
            .filter(cp => !hiddenCheckpoints.includes(cp))
            .filter(cp => cp.toLowerCase().includes(visibleSearch.toLowerCase()))
            .sort(),
        [allCheckpoints, hiddenCheckpoints, visibleSearch]
    );

    const filteredHiddenCheckpoints = useMemo(() =>
        hiddenCheckpoints
            .filter(cp => cp.toLowerCase().includes(hiddenSearch.toLowerCase()))
            .sort(),
        [hiddenCheckpoints, hiddenSearch]
    );

    if (!isOpen) return null;

    const handleToggleSelect = (listType: 'visible' | 'hidden', checkpoint: string) => {
        const [selected, setSelected] = listType === 'visible' ? [selectedVisible, setSelectedVisible] : [selectedHidden, setSelectedHidden];
        if (selected.includes(checkpoint)) {
            setSelected(prev => prev.filter(item => item !== checkpoint));
        } else {
            setSelected(prev => [...prev, checkpoint]);
        }
    };

    const handleToggleSelectAll = (listType: 'visible' | 'hidden') => {
        if (listType === 'visible') {
            if (selectedVisible.length === visibleCheckpoints.length) {
                setSelectedVisible([]);
            } else {
                setSelectedVisible(visibleCheckpoints);
            }
        } else {
            if (selectedHidden.length === filteredHiddenCheckpoints.length) {
                setSelectedHidden([]);
            } else {
                setSelectedHidden(filteredHiddenCheckpoints);
            }
        }
    };

    const handleHide = () => {
        onUpdateHiddenCheckpoints(current => [...current, ...selectedVisible]);
        setSelectedVisible([]);
    };

    const handleUnhide = () => {
        onUpdateHiddenCheckpoints(current => current.filter(cp => !selectedHidden.includes(cp)));
        setSelectedHidden([]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="checkpoint-manager-title">
            <div className="bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <h2 id="checkpoint-manager-title" className="text-xl font-bold text-text-primary p-4 border-b border-border-primary flex-shrink-0">
                    Manage ComfyUI Checkpoints
                </h2>
                <div className="p-4 text-sm text-info bg-info-bg/50 border-b border-border-primary space-y-2">
                    <p>
                        <strong>File Management:</strong> This manager helps you organize your model list, so you know which ones are your main models. Hiding a model removes it from the dropdown but does <strong className="font-extrabold">NOT</strong> delete the file.
                    </p>
                    <p>
                        To permanently remove a model, please delete the file directly from your ComfyUI models folder (e.g., `ComfyUI/models/checkpoints`).
                    </p>
                </div>

                <div className="flex-grow p-6 grid grid-cols-2 gap-4 items-stretch overflow-hidden">
                    <CheckpointList
                        title="Visible Models"
                        checkpoints={visibleCheckpoints}
                        selected={selectedVisible}
                        onToggleSelect={(cp) => handleToggleSelect('visible', cp)}
                        onToggleSelectAll={() => handleToggleSelectAll('visible')}
                        searchTerm={visibleSearch}
                        onSearchChange={setVisibleSearch}
                        isAllSelected={visibleCheckpoints.length > 0 && selectedVisible.length === visibleCheckpoints.length}
                    />
                    <CheckpointList
                        title="Hidden Models"
                        checkpoints={filteredHiddenCheckpoints}
                        selected={selectedHidden}
                        onToggleSelect={(cp) => handleToggleSelect('hidden', cp)}
                        onToggleSelectAll={() => handleToggleSelectAll('hidden')}
                        searchTerm={hiddenSearch}
                        onSearchChange={setHiddenSearch}
                        isAllSelected={filteredHiddenCheckpoints.length > 0 && selectedHidden.length === filteredHiddenCheckpoints.length}
                    />
                </div>

                <div className="flex justify-center items-center gap-4 p-4 border-t border-border-primary flex-shrink-0">
                    <button onClick={handleHide} disabled={selectedVisible.length === 0} className="px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed">
                        Hide Selected ({selectedVisible.length}) &rarr;
                    </button>
                    <button onClick={handleUnhide} disabled={selectedHidden.length === 0} className="px-4 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:bg-bg-tertiary disabled:cursor-not-allowed">
                        &larr; Show Selected ({selectedHidden.length})
                    </button>
                </div>

                <div className="flex justify-end items-center p-4 pt-0">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-text-secondary bg-bg-tertiary/80 hover:bg-bg-tertiary rounded-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckpointManagerModal;