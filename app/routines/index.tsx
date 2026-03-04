/**
 * Listado de rutinas guardadas y acceso a generar nueva.
 */

import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';

export default function RoutinesListScreen() {
  const router = useRouter();
  const { routineRepo } = useApp();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useFocusEffect(
    useCallback(() => {
      routineRepo.getAll().then(setRoutines);
    }, [routineRepo])
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.generateButton} onPress={() => router.push('/routines/generate')}>
        <Text style={styles.generateButtonText}>+ Generar nueva rutina</Text>
      </Pressable>
      {routines.length === 0 ? (
        <Text style={styles.empty}>No hay rutinas. Genera una desde tu perfil y objetivo.</Text>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/routines/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.objective} · {item.level} · {item.days.length} días
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  generateButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#666', marginTop: 4 },
});
