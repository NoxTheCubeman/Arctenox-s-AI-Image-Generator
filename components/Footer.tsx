import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center p-4 mt-8">
      <div className="max-w-3xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-accent mb-4 block mx-auto" viewBox="0 0 64 64">
              <path fill="currentColor" d="M32 4 L24 12 L8 24 C8 40 20 60 32 60 C44 60 56 40 56 24 L40 12 L32 4 Z" />
              <path fill="var(--color-bg-primary)" d="M32 22 L24 50 H28.5 L32 38 L35.5 50 H40 L32 22 Z" />
          </svg>
          <p className="text-text-secondary/60 text-sm">
              Made by Google Gemini 2.5 Pro and{' '}
              <a 
                  href="https://civitai.com/user/Arctenox" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent/80 hover:text-accent font-semibold transition-colors"
              >
                  Arctenox
              </a>
          </p>
          <p className="text-text-secondary/60 text-sm">
            Powered by Google Gemini.
          </p>
          <p className="text-text-secondary/40 text-xs mt-2">
            Please use this tool responsibly. All generated content is subject to AI safety policies. Prompts intended to generate harmful, unethical, or explicit content are strictly prohibited and will be blocked.
          </p>
      </div>
    </footer>
  );
};

export default Footer;