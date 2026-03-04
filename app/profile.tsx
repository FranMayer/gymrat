/**
 * Pantalla de perfil de usuario: edición de datos e IMC.
 */

import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile, saveProfile } from '@/usecases';
import { calculateBMI } from '@/domain/entities';
import type { UserProfile, Objective, Level, Sex } from '@/domain/entities';

const OBJECTIVES: Objective[] = ['tonificar', 'adelgazar', 'ganar_masa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];
const SEX_OPTIONS: Sex[] = ['hombre', 'mujer', 'otro'];

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfileRepo } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  const update = (patch: Partial<UserProfile>) => {
    if (profile) setProfile({ ...profile, ...patch });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await saveProfile(userProfileRepo, profile);
    setSaving(false);
    router.back();
  };

  if (!profile) return <View style={styles.container}><Text>Cargando...</Text></View>;

  const bmi = calculateBMI(profile.weightKg, profile.heightCm);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <Text>Edad</Text>
        <TextInput
          style={styles.input}
          value={String(profile.age)}
          keyboardType="number-pad"
          onChangeText={(t) => update({ age: parseInt(t, 10) || 0 })}
        />
      </View>
      <View style={styles.field}>
        <Text>Sexo</Text>
        <View style={styles.row}>
          {SEX_OPTIONS.map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, profile.sex === s && styles.chipActive]}
              onPress={() => update({ sex: s })}
            >
              <Text>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          value={String(profile.heightCm)}
          keyboardType="number-pad"
          onChangeText={(t) => update({ heightCm: parseFloat(t) || 0 })}
        />
      </View>
      <View style={styles.field}>
        <Text>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={String(profile.weightKg)}
          keyboardType="decimal-pad"
          onChangeText={(t) => update({ weightKg: parseFloat(t) || 0 })}
        />
      </View>
      <View style={styles.bmiBox}>
        <Text style={styles.bmiLabel}>IMC</Text>
        <Text style={styles.bmiValue}>{bmi}</Text>
      </View>
      <View style={styles.field}>
        <Text>Objetivo</Text>
        <View style={styles.row}>
          {OBJECTIVES.map((o) => (
            <Pressable
              key={o}
              style={[styles.chip, profile.objective === o && styles.chipActive]}
              onPress={() => update({ objective: o })}
            >
              <Text>{o}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text>Nivel</Text>
        <View style={styles.row}>
          {LEVELS.map((l) => (
            <Pressable
              key={l}
              style={[styles.chip, profile.level === l && styles.chipActive]}
              onPress={() => update({ level: l })}
            >
              <Text>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  chipActive: { backgroundColor: '#2563eb' },
  bmiBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  bmiLabel: { fontSize: 14, color: '#666' },
  bmiValue: { fontSize: 28, fontWeight: '700' },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
