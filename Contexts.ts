import { createContext } from 'react';

export const ThemeContext = createContext({
  isDark: false,
  setIsDark: (v: boolean) => {},
});

export const HapticsContext = createContext({
  hapticsEnabled: true,
  setHapticsEnabled: (v: boolean) => {},
}); 