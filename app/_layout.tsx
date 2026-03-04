/**
 * Layout raíz de la app (Expo Router).
 * Envuelve la app con el proveedor de dependencias y, en dev, con ErrorBoundary.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '@/app/AppContext';
import { DevErrorBoundary } from '@/app/DevErrorBoundary';
import { IS_DEV } from '@/config';
import { logger } from '@/lib';

export default function RootLayout() {
  useEffect(() => {
    if (IS_DEV) logger.info('App started (dev mode)');
  }, []);
  const content = (
    <AppProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Gymrat' }} />
        <Stack.Screen name="profile" options={{ title: 'Mi perfil' }} />
        <Stack.Screen name="routines/index" options={{ title: 'Rutinas' }} />
        <Stack.Screen name="routines/[id]" options={{ title: 'Rutina' }} />
        <Stack.Screen name="routines/generate" options={{ title: 'Generar rutina' }} />
        <Stack.Screen name="routines/log" options={{ title: 'Registrar entrenamiento' }} />
        {IS_DEV && (
          <Stack.Screen name="dev" options={{ title: 'DevTools' }} />
        )}
      </Stack>
    </AppProvider>
  );
  return IS_DEV ? <DevErrorBoundary>{content}</DevErrorBoundary> : content;
}
