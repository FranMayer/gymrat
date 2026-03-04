/**
 * Detalle de una rutina: días, ejercicios (series x reps).
 * Permite registrar entrenamiento (peso real, reps, fecha).
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { routineRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (id) routineRepo.getById(id).then(setRoutine);
  }, [id, routineRepo]);

  if (!routine) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{routine.name}</Text>
      <Text style={styles.meta}>{routine.objective} · {routine.level}</Text>
      {routine.days.map((day) => (
        <View key={day.id} style={styles.dayCard}>
          <Text style={styles.dayName}>{day.name}</Text>
          {day.exercises.map((ex, i) => (
            <View key={`${ex.exerciseId}-${i}`} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.setsReps}>
                {ex.sets} × {ex.reps} reps
                {ex.suggestedWeightKg != null ? ` · ${ex.suggestedWeightKg} kg` : ''}
              </Text>
            </View>
          ))}
          <Pressable
            style={styles.logButton}
            onPress={() => router.push({ pathname: '/routines/log', params: { routineId: routine.id, routineDayId: day.id } })}
          >
            <Text style={styles.logButtonText}>Registrar entrenamiento</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 14, color: '#666', marginBottom: 20 },
  dayCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayName: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  exerciseRow: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  exerciseName: { fontWeight: '500' },
  setsReps: { fontSize: 13, color: '#666', marginTop: 2 },
  logButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
  },
  logButtonText: { color: '#2563eb', fontWeight: '500' },
});
