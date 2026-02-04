// src/components/Logo.tsx
import React from 'react';
import { Image } from 'react-native';
import { useThemeMode } from '../store/settings/themeStore';

export const Logo = ({ size = 40 }) => {
  const theme = useThemeMode(); // 'dark' | 'light'

  const source =
    theme === 'dark'
      ? require('../assets/logo/logo-dark.png')
      : require('../assets/logo/logo-light.png');

  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
      }}
      resizeMode="contain"
    />
  );
};
