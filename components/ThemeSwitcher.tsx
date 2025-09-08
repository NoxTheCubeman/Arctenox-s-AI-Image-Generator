import React from 'react';
import { themes } from '../lib/themes';
import { CustomTheme } from '../types';

interface ThemeSwitcherProps {
  theme: string;
  setTheme: (theme: string) => void;
  customThemes: CustomTheme[];
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme, customThemes }) => {
  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="appearance-none bg-bg-tertiary border border-border-primary text-text-primary text-sm rounded-md px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
        aria-label="Select color theme"
      >
        <optgroup label="Built-in Themes">
          {Object.keys(themes).map((themeKey) => (
            <option key={themeKey} value={themeKey} className="capitalize bg-bg-secondary text-text-primary">
              {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
            </option>
          ))}
        </optgroup>
        {customThemes.length > 0 && (
          <optgroup label="Custom Themes">
            {customThemes.map((customTheme) => (
              <option key={customTheme.id} value={customTheme.id} className="bg-bg-secondary text-text-primary">
                {customTheme.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-primary">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default ThemeSwitcher;