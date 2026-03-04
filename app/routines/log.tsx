/**
 * Pantalla para registrar un entrenamiento: peso y repeticiones por serie.
 * Fase 1: formulario simple por ejercicio (series con peso + reps), fecha.
 */

import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import { logWorkout } from '@/usecases';
import type { Routine } from '@/domain/entities';
import type { WorkoutLogSet } from '@/domain/entities';

export default function LogWorkoutScreen() {
  const { routineId, routineDayId } = useLocalSearchParams<{ routineId: string; routineDayId: string }>();
  const router = useRouter();
  const { routineRepo, workoutLogRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  /** Por cada exerciseId: array de { setNumber, reps, weightKg } */
  const [entries, setEntries] = useState<Record<string, { reps: string; weightKg: string }[]>>({});

  useEffect(() => {
    if (routineId) routineRepo.getById(routineId).then(setRoutine);
  }, [routineId, routineRepo]);

  const day = routine?.days.find((d) => d.id === routineDayId);
  if (!routine || !day) return <View style={styles.container}><Text>Cargando...</Text></View>;

  const initEntry = (exerciseId: string, sets: number) => {
    if (entries[exerciseId]) return;
    setEntries((prev) => ({
      ...prev,
      [exerciseId]: Array.from({ length: sets }, () => ({ reps: '', weightKg: '' })),
    }));
  };

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weightKg',
    value: string
  ) => {
    setEntries((prev) => {
      const arr = [...(prev[exerciseId] ?? [])];
      arr[setIndex] = { ...arr[setIndex], [field]: value };
      return { ...prev, [exerciseId]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    for (const ex of day.exercises) {
      initEntry(ex.exerciseId, ex.sets);
      const setsData = entries[ex.exerciseId] ?? Array.from({ length: ex.sets }, () => ({ reps: '', weightKg: '' }));
      const sets: WorkoutLogSet[] = setsData.map((s, i) => ({
        setNumber: i + 1,
        reps: parseInt(s.reps, 10) || 0,
        weightKg: parseFloat(s.weightKg) || 0,
      }));
      await logWorkout(workoutLogRepo, {
        routineId: routine.id,
        routineDayId: day.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        sets,
        date,
      });
    }
    setSaving(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text>Fecha</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
      </View>
      {day.exercises.map((ex) => {
        initEntry(ex.exerciseId, ex.sets);
        const setsData = entries[ex.exerciseId] ?? Array.from({ length: ex.sets }, () => ({ reps: '', weightKg: '' }));
        return (
          <View key={ex.exerciseId} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            {setsData.map((_, i) => (
              <View key={i} style={styles.setRow}>
                <Text>Serie {i + 1}</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Reps"
                  value={setsData[i]?.reps}
                  onChangeText={(t) => updateSet(ex.exerciseId, i, 'reps', t)}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={styles.smallInput}
                  placeholder="Peso (kg)"
                  value={setsData[i]?.weightKg}
                  onChangeText={(t) => updateSet(ex.exerciseId, i, 'weightKg', t)}
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
          </View>
        );
      })}
      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar entrenamiento'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  field: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseName: { fontWeight: '600', marginBottom: 10 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    width: 80,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
