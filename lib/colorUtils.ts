import { themes, Theme } from './themes';

// --- COLOR CONVERSION UTILITIES ---

/**
 * Converts an "r, g, b" string to a hex color string.
 */
export function rgbStringToHex(rgbStr: string): string {
  if (!rgbStr || typeof rgbStr !== 'string') return '#000000';
  const [r, g, b] = rgbStr.split(',').map(Number);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Converts a hex color string to an "r, g, b" string.
 */
export function hexToRgbString(hex: string): string {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '0, 0, 0';
  let r = 0, g = 0, b = 0;
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '0, 0, 0';
  return `${r}, ${g}, ${b}`;
}

// --- THEME RANDOMIZER ---

/**
 * Generates a random integer between min and max (inclusive).
 */
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Converts HSL color values to an RGB object.
 */
const hslToRgb = (h: number, s: number, l: number): { r: number, g: number, b: number } => {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
    return { r, g, b };
}

/**
 * Converts an RGB object to a hex string.
 */
const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Generates a random, aesthetically pleasing theme.
 */
export const generateRandomTheme = (): Theme => {
    const isDarkTheme = Math.random() > 0.5;

    // Generate a base color scheme
    const baseHue = randomInt(0, 360);
    const saturation = randomInt(10, 50); // Background saturation

    // Define base lightness for dark/light themes
    const bgL_base = isDarkTheme ? randomInt(10, 20) : randomInt(95, 100);
    const txtL_base = isDarkTheme ? randomInt(90, 98) : randomInt(5, 15);

    // Create background colors
    const bgPrimaryRgb = hslToRgb(baseHue, saturation, bgL_base);
    const bgSecondaryRgb = hslToRgb(baseHue, saturation, isDarkTheme ? bgL_base + 6 : bgL_base - 3);
    const bgTertiaryRgb = hslToRgb(baseHue, saturation, isDarkTheme ? bgL_base + 12 : bgL_base - 6);
    const borderRgb = hslToRgb(baseHue, saturation, isDarkTheme ? bgL_base + 20 : bgL_base - 12);
    
    // Create text colors
    const textPrimaryRgb = hslToRgb(baseHue, 10, txtL_base);
    const textSecondaryRgb = hslToRgb(baseHue, 8, isDarkTheme ? txtL_base - 20 : txtL_base + 30);
    
    // Create accent color (complementary or triadic)
    const accentHue = (baseHue + randomInt(150, 210)) % 360;
    const accentRgb = hslToRgb(accentHue, randomInt(70, 90), randomInt(55, 65));
    const accentHoverRgb = hslToRgb(accentHue, randomInt(70, 90), randomInt(45, 55));
    
    // Create status colors that adapt to the theme's lightness
    const statusTextL = isDarkTheme ? 70 : 40;
    const statusBgL = isDarkTheme ? 25 : 95;

    const dangerRgb = hslToRgb(0, 70, statusTextL);
    const successRgb = hslToRgb(120, 60, statusTextL);
    const warningRgb = hslToRgb(45, 80, statusTextL);
    const infoRgb = hslToRgb(210, 70, statusTextL);
    
    const dangerBgRgb = hslToRgb(0, 30, statusBgL);
    const successBgRgb = hslToRgb(120, 30, statusBgL);
    const warningBgRgb = hslToRgb(45, 30, statusBgL);
    const infoBgRgb = hslToRgb(210, 30, statusBgL);
    
    const theme: Theme = {
        '--color-bg-primary-rgb': `${bgPrimaryRgb.r}, ${bgPrimaryRgb.g}, ${bgPrimaryRgb.b}`,
        '--color-bg-secondary-rgb': `${bgSecondaryRgb.r}, ${bgSecondaryRgb.g}, ${bgSecondaryRgb.b}`,
        '--color-bg-tertiary-rgb': `${bgTertiaryRgb.r}, ${bgTertiaryRgb.g}, ${bgTertiaryRgb.b}`,
        '--color-danger-bg-rgb': `${dangerBgRgb.r}, ${dangerBgRgb.g}, ${dangerBgRgb.b}`,
        '--color-success-bg-rgb': `${successBgRgb.r}, ${successBgRgb.g}, ${successBgRgb.b}`,
        '--color-warning-bg-rgb': `${warningBgRgb.r}, ${warningBgRgb.g}, ${warningBgRgb.b}`,
        '--color-info-bg-rgb': `${infoBgRgb.r}, ${infoBgRgb.g}, ${infoBgRgb.b}`,
        '--color-primary': rgbToHex(textPrimaryRgb),
        '--color-secondary': rgbToHex(textSecondaryRgb),
        '--color-accent': rgbToHex(accentRgb),
        '--color-accent-hover': rgbToHex(accentHoverRgb),
        '--color-text-primary': rgbToHex(textPrimaryRgb),
        '--color-text-secondary': rgbToHex(textSecondaryRgb),
        '--color-border-primary': rgbToHex(borderRgb),
        '--color-danger': rgbToHex(dangerRgb),
        '--color-success': rgbToHex(successRgb),
        '--color-warning': rgbToHex(warningRgb),
        '--color-info': rgbToHex(infoRgb),
    };
    return theme;
};