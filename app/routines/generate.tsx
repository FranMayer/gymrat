/**
 * Pantalla para generar una nueva rutina: objetivo + nivel, luego guardar.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { generateAndSaveRoutine } from '@/usecases';
import type { Objective, Level } from '@/domain/entities';

const OBJECTIVES: Objective[] = ['tonificar', 'adelgazar', 'ganar_masa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];

export default function GenerateRoutineScreen() {
  const router = useRouter();
  const { routineRepo, routineGenerator } = useApp();
  const [objective, setObjective] = useState<Objective>('tonificar');
  const [level, setLevel] = useState<Level>('principiante');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const { routineId } = await generateAndSaveRoutine(routineGenerator, routineRepo, {
      objective,
      level,
    });
    setLoading(false);
    router.replace(`/routines/${routineId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Objetivo</Text>
      <View style={styles.row}>
        {OBJECTIVES.map((o) => (
          <Pressable
            key={o}
            style={[styles.chip, objective === o && styles.chipActive]}
            onPress={() => setObjective(o)}
          >
            <Text style={objective === o ? styles.chipTextActive : undefined}>{o}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, styles.labelTop]}>Nivel</Text>
      <View style={styles.row}>
        {LEVELS.map((l) => (
          <Pressable
            key={l}
            style={[styles.chip, level === l && styles.chipActive]}
            onPress={() => setLevel(l)}
          >
            <Text style={level === l ? styles.chipTextActive : undefined}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Generando...' : 'Generar y guardar rutina'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  label: { fontSize: 16, fontWeight: '600' },
  labelTop: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipTextActive: { color: '#fff' },
  button: {
    marginTop: 32,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
