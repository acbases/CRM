import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function checkUpdate() {
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    }
    checkUpdate();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="rapportB2B" />
        <Stack.Screen name="resultB2B" />
        <Stack.Screen name="rapportRetail" />
        <Stack.Screen name="resultRetail" />
        <Stack.Screen name="scan" />
      </Stack>
    </ThemeProvider>
  );
}