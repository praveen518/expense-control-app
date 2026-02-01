import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useSalary } from '../hooks/useSettings';
import { setSalary } from '../store/settingsStore';
import { formatINR } from '../utils/currency';
import { colors } from '../themes/colors';

export const SettingsScreen = () => {
  const salary = useSalary(); // reactive
  const [isEditing, setIsEditing] = useState(false);
  const [draftSalary, setDraftSalary] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setDraftSalary(
        typeof salary === 'number' ? String(salary) : ''
      );
    }
  }, [salary, isEditing]);

  const onSave = async () => {
    const value = Number(
      draftSalary.replace(/[^0-9]/g, '')
    );

    if (!Number.isFinite(value) || value <= 0) return;

    await setSalary(value);
    setIsEditing(false);
  };

  const onCancel = () => {
    setDraftSalary(
      typeof salary === 'number' ? String(salary) : ''
    );
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Income
      </Text>

      {/* =========================
          VIEW MODE
         ========================= */}
      {!isEditing && (
        <View style={[styles.card, styles.cardRow]}>
          <View>
            <Text style={styles.label}>
              Monthly Salary
            </Text>
            <Text style={styles.value}>
              {typeof salary === 'number' && salary > 0
                ? formatINR(salary)
                : 'Not set'}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.action}>
              Edit
            </Text>
          </Pressable>
        </View>
      )}

      {/* =========================
          EDIT MODE
         ========================= */}
      {isEditing && (
        <View style={styles.card}>
          <Text style={styles.label}>
            Monthly Salary
          </Text>

          <TextInput
            value={draftSalary}
            onChangeText={setDraftSalary}
            keyboardType="numeric"
            autoFocus
            placeholder="Enter amount"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <View style={styles.actionsRow}>
            <Pressable onPress={onCancel}>
              <Text style={styles.cancel}>
                Cancel
              </Text>
            </Pressable>

            <Pressable onPress={onSave}>
              <Text style={styles.save}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
  },

  /* Base card */
  card: {
    backgroundColor: colors.surfaceSoft,
    padding: 16,
    borderRadius: 12,
  },

  /* Horizontal row layout (view mode only) */
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: colors.textMuted,
  },

  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },

  action: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Edit mode */
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    width: '100%',
  },

  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },

  cancel: {
    fontSize: 14,
    color: colors.textMuted,
  },

  save: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
