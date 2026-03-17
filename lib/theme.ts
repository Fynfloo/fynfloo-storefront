export interface ThemeSettings {
  primaryColour: string;
  secondaryColour: string;
  fontFamily: string;
  borderRadius: number;
  buttonStyle: 'rounded' | 'sharp';
}

const defaultTheme: ThemeSettings = {
  primaryColour: '#111827',
  secondaryColour: '#F97316',
  fontFamily: 'Inter, sans-serif',
  borderRadius: 6,
  buttonStyle: 'rounded',
};

/**
 * Converts merchant themeSettings JSON to a CSS custom properties string.
 * Injected into the storefront <head> per merchant at render time.
 * Tailwind utilities reference these variables for per-merchant theming.
 */
export function buildThemeCSS(settings: Partial<ThemeSettings>): string {
  const theme = { ...defaultTheme, ...settings };

  return `
    :root {
      --colour-primary: ${theme.primaryColour};
      --colour-secondary: ${theme.secondaryColour};
      --font-body: ${theme.fontFamily};
      --radius-button: ${theme.borderRadius}px;
      --button-style: ${theme.buttonStyle};
    }
  `.trim();
}
