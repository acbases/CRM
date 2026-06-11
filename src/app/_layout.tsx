import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Layout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const { user, loading } = useAuth();
  const currentSegment = segments[0]; // string primitive — stable comme dépendance

  // 🔐 protection routes
  useEffect(() => {
    if (loading) return;

    const inLogin = currentSegment === 'login';

    if (!user && !inLogin) {
      router.replace('/login');
    }

    if (user && inLogin) {
      router.replace('/(tabs)/accueil');
    }
  }, [user, currentSegment, loading]);

  // 🚀 updates
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="clientDetails" />
        <Stack.Screen name="rapportB2B" />
        <Stack.Screen name="resultB2B" />
        <Stack.Screen name="rapportRetail" />
        <Stack.Screen name="resultRetail" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="scan2" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}