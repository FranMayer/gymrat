/**
 * Pantalla DevTools: solo accesible en modo desarrollo (IS_DEV).
 * Muestra perfil, última rutina, último WorkoutLog y acciones para reset/mock.
 * Usa casos de uso y repos reales (Clean Architecture).
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import {
  getOrCreateProfile,
  generateAndSaveRoutine,
  devResetDatabase,
  insertMockProgress,
  simulatePerformanceChange,
} from '@/usecases';
import { IS_DEV } from '@/config';
import { prettyPrintJSON, logger } from '@/lib';
import type { UserProfile } from '@/domain/entities';
import type { Routine } from '@/domain/entities';
import type { WorkoutSession } from '@/domain/entities';

export default function DevToolsScreen() {
  const router = useRouter();
  const { userProfileRepo, routineRepo, workoutLogRepo, routineGenerator } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastRoutine, setLastRoutine] = useState<Routine | null>(null);
  const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { profile: p } = await getOrCreateProfile(userProfileRepo);
      setProfile(p);
      const routines = await routineRepo.getAll();
      setLastRoutine(routines[0] ?? null);
      const sessions = await workoutLogRepo.getSessionsByDateRange('2000-01-01', '2100-12-31');
      setLastSession(sessions[0] ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      logger.error('DevTools load error:', e);
    }
  }, [userProfileRepo, routineRepo, workoutLogRepo]);

  useEffect(() => {
    if (IS_DEV) load();
  }, [IS_DEV, load]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setLoading(label);
    setError(null);
    try {
      await fn();
      logger.info(`DevTools: ${label} OK`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      logger.error(`DevTools ${label} error:`, e);
    } finally {
      setLoading(null);
    }
  };

  const handleResetDb = () =>
    run('Reset DB', () => devResetDatabase(userProfileRepo, routineRepo, workoutLogRepo));

  const handleRegenerateRoutine = () =>
    run('Regenerar rutina', async () => {
      const objective = profile?.objective ?? 'tonificar';
      const level = profile?.level ?? 'principiante';
      await generateAndSaveRoutine(routineGenerator, routineRepo, { objective, level });
    });

  const handleInsertMock = () =>
    run('Insertar mock', () => insertMockProgress(routineRepo, workoutLogRepo, { sessionsCount: 3 }));

  const handleSimulateUp = () =>
    run('Simular aumento', () =>
      simulatePerformanceChange(routineRepo, workoutLogRepo, { trend: 'up', sessionsCount: 4 }));

  const handleSimulateDown = () =>
    run('Simular disminución', () =>
      simulatePerformanceChange(routineRepo, workoutLogRepo, { trend: 'down', sessionsCount: 4 }));

  if (!IS_DEV) {
    router.replace('/');
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Perfil actual</Text>
      <View style={styles.jsonBlock}>
        <Text style={styles.mono}>{profile ? prettyPrintJSON(profile) : '—'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Última rutina generada</Text>
      <View style={styles.jsonBlock}>
        <Text style={styles.mono} numberOfLines={50}>
          {lastRoutine ? prettyPrintJSON(lastRoutine) : '—'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Último WorkoutLog (sesión)</Text>
      <View style={styles.jsonBlock}>
        <Text style={styles.mono} numberOfLines={30}>
          {lastSession ? prettyPrintJSON(lastSession) : '—'}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Acciones</Text>
      <Pressable
        style={[styles.button, styles.danger]}
        onPress={handleResetDb}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>Resetear base de datos</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={handleRegenerateRoutine}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>
          {loading === 'Regenerar rutina' ? '…' : 'Regenerar rutina manualmente'}
        </Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleInsertMock} disabled={loading !== null}>
        <Text style={styles.buttonText}>
          {loading === 'Insertar mock' ? '…' : 'Insertar datos mock de progreso'}
        </Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleSimulateUp} disabled={loading !== null}>
        <Text style={styles.buttonText}>
          {loading === 'Simular aumento' ? '…' : 'Simular aumento de rendimiento'}
        </Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleSimulateDown} disabled={loading !== null}>
        <Text style={styles.buttonText}>
          {loading === 'Simular disminución' ? '…' : 'Simular disminución de rendimiento'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginTop: 16, marginBottom: 6 },
  jsonBlock: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8 },
  mono: { fontFamily: 'monospace', fontSize: 11, color: '#e2e8f0' },
  error: { color: '#f87171', marginTop: 8, marginBottom: 8 },
  button: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  danger: { backgroundColor: '#7f1d1d' },
  buttonText: { color: '#f1f5f9', fontSize: 14 },
});
