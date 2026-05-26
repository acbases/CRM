import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  useEffect(() => {
    async function checkUpdate() {
      if (!__DEV__) { // Seulement en production/preview, pas en dev
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync(); // Redémarre avec la nouvelle version
          }
        } catch (e) {
          console.log('Erreur update:', e);
        }
      }
    }
    checkUpdate();
  }, []);

  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
