/**
 * Pantalla principal: acceso a perfil, generador de rutina y listado de rutinas.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile } from '@/usecases';
import type { UserProfile } from '@/domain/entities';
import { calculateBMI } from '@/domain/entities';
import { IS_DEV } from '@/config';

export default function HomeScreen() {
  const router = useRouter();
  const { userProfileRepo } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : null;

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.card}>
          <Text style={styles.title}>Perfil</Text>
          <Text>
            {profile.age} años · {profile.objective} · {profile.level}
          </Text>
          {bmi != null && (
            <Text style={styles.bmi}>IMC: {bmi}</Text>
          )}
          <Pressable style={styles.button} onPress={() => router.push('/profile')}>
            <Text style={styles.buttonText}>Editar perfil</Text>
          </Pressable>
        </View>
      )}
      <Pressable style={styles.button} onPress={() => router.push('/routines')}>
        <Text style={styles.buttonText}>Ver rutinas</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.primary]}
        onPress={() => router.push('/routines/generate')}
      >
        <Text style={[styles.buttonText, styles.primaryButtonText]}>Generar nueva rutina</Text>
      </Pressable>
      {IS_DEV && (
        <Pressable style={[styles.button, styles.dev]} onPress={() => router.push('/dev')}>
          <Text style={styles.buttonText}>DevTools</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bmi: {
    marginTop: 4,
    fontWeight: '500',
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 10,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  dev: {
    backgroundColor: '#475569',
  },
  buttonText: {
    fontSize: 16,
    color: '#111',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});
