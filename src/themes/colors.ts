// export const colors = {
//   primary: '#22c55e',
//   primarySoft: '#ecfeff',
//   primaryBorder: '#86efac',

//   background: '#f8fafc',
//   surface: '#020617',         // header / dashboard
//   surfaceSoft: '#ffffff',     // cards

//   textPrimary: '#020617',
//   textMuted: '#64748b',

//   danger: '#dc2626',
//   divider: '#e5e7eb',
// };

import { resolveTheme } from './theme';
import { themeStore } from '../store/settings/themeStore';
import { Theme } from './theme.types';

type ThemeKey = keyof Theme;

export const colors: Theme = new Proxy({} as Theme, {
  get(_, prop: ThemeKey) {
    const mode = themeStore.getSnapshot();
    const theme = resolveTheme(mode);
    return theme[prop];
  },
});
