import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { CustomTheme } from '../types';

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  onOpenThemeEditor: () => void;
  customThemes: CustomTheme[];
  onHeaderClick: () => void;
  onOpenHistory: () => void;
  onOpenApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onOpenThemeEditor, customThemes, onHeaderClick, onOpenHistory, onOpenApiKeyModal }) => {
  return (
    <header className="bg-bg-secondary/50 backdrop-blur-sm p-4 sticky top-0 z-10 shadow-lg animate-fade-in">
      <div className="container mx-auto grid grid-cols-3 items-center">
        {/* Left-aligned content */}
        <div className="flex justify-start items-center gap-4">
           <button
                onClick={onOpenHistory}
                className="text-sm font-medium text-accent hover:text-text-primary transition-colors flex items-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                History
            </button>
        </div>
        
        {/* Centered Logo and Title */}
        <div className="flex items-center justify-center cursor-pointer" onClick={onHeaderClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" viewBox="0 0 64 64">
                <path fill="currentColor" d="M32 4 L24 12 L8 24 C8 40 20 60 32 60 C44 60 56 40 56 24 L40 12 L32 4 Z" />
                <path fill="var(--color-bg-secondary)" d="M32 22 L24 50 H28.5 L32 38 L35.5 50 H40 L32 22 Z" />
            </svg>
            <h1 className="text-2xl font-bold text-text-primary tracking-wider mx-4 text-center whitespace-nowrap">Arctenox's Image Generator App</h1>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" viewBox="0 0 64 64">
                <path fill="currentColor" d="M32 4 L24 12 L8 24 C8 40 20 60 32 60 C44 60 56 40 56 24 L40 12 L32 4 Z" />
                <path fill="var(--color-bg-secondary)" d="M32 22 L24 50 H28.5 L32 38 L35.5 50 H40 L32 22 Z" />
            </svg>
        </div>

        {/* Right-aligned content */}
        <div className="flex justify-end items-center gap-4">
            <button
                onClick={onOpenApiKeyModal}
                className="text-sm font-medium text-accent hover:text-text-primary transition-colors"
            >
                Manage API Key
            </button>
            <button
                onClick={onOpenThemeEditor}
                className="text-sm font-medium text-accent hover:text-text-primary transition-colors"
            >
                Manage Themes
            </button>
            <ThemeSwitcher theme={theme} setTheme={setTheme} customThemes={customThemes} />
        </div>
      </div>
    </header>
  );
};

export default Header;