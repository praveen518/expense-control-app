import { Appearance } from 'react-native';
import { lightTheme } from './light';
import { darkTheme } from './dark';
import { Theme } from './theme.types';

export type ThemeMode = 'light' | 'dark' | 'system';

export const resolveTheme = (mode: ThemeMode): Theme => {
  if (mode === 'system') {
    const scheme = Appearance.getColorScheme();
    return scheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};
