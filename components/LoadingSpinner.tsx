import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    subMessage?: string | undefined;
    progress?: { value: number; max: number } | null;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = "Generating your masterpiece...", 
    subMessage = "This can take a moment. Please wait.",
    progress = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary/80 animate-fade-in w-full">
        <svg className="animate-spin h-12 w-12 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-semibold">{message}</p>
        {subMessage && <p className="text-sm mb-4">{subMessage}</p>}
        {progress && (
            <div className="w-full max-w-sm bg-bg-tertiary rounded-full h-2.5">
                <div 
                    className="bg-accent h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(progress.value / progress.max) * 100}%` }}
                ></div>
            </div>
        )}
    </div>
  );
};

export default LoadingSpinner;
