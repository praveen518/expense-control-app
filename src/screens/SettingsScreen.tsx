import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated, 
  Platform
} from 'react-native';

import { useSalary } from '../hooks/useSettings';
import { setSalary } from '../store/settingsStore';
import { formatINR } from '../utils/currency';
import { colors } from '../themes/colors';
import { themeStore, useThemeMode } from '../store/settings/themeStore';

const RadioIndicator = ({ selected }: { selected: boolean }) => {
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: selected ? 1 : 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: selected ? 1 : 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selected]);

  return (
    <View style={styles.radioOuter}>
      <Animated.View
        style={[
          styles.radioInner,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
};

export const SettingsScreen = () => {
  const salary = useSalary();
  const themeMode = useThemeMode(); // 🔑 re-render on theme change

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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* =========================
          INCOME
         ========================= */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textMuted },
        ]}
      >
        Income
      </Text>

      {!isEditing && (
        <View
          style={[
            styles.card,
            styles.cardRow,
            { backgroundColor: colors.surfaceSoft },
          ]}
        >
          <View>
            <Text
              style={[
                styles.label,
                { color: colors.textMuted },
              ]}
            >
              Monthly Salary
            </Text>

            <Text
              style={[
                styles.value,
                { color: colors.textPrimary },
              ]}
            >
              {typeof salary === 'number' && salary > 0
                ? formatINR(salary)
                : 'Not set'}
            </Text>
          </View>

          <Pressable onPress={() => setIsEditing(true)}>
            <Text
              style={[
                styles.action,
                { color: colors.primary },
              ]}
            >
              Edit
            </Text>
          </Pressable>
        </View>
      )}

      {isEditing && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceSoft },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: colors.textMuted },
            ]}
          >
            Monthly Salary
          </Text>

          <TextInput
            value={draftSalary}
            onChangeText={setDraftSalary}
            keyboardType="numeric"
            autoFocus
            placeholder="Enter amount"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          />

          <View style={styles.actionsRow}>
            <Pressable onPress={onCancel}>
              <Text
                style={[
                  styles.cancel,
                  { color: colors.textMuted },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable onPress={onSave}>
              <Text
                style={[
                  styles.save,
                  { color: colors.primary },
                ]}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* =========================
          APPEARANCE
         ========================= */}
      <Text
        style={[
          styles.sectionTitle,
          {
            marginTop: 24,
            color: colors.textMuted,
          },
        ]}
      >
        Appearance
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSoft },
        ]}
      >
        {(['light', 'dark', 'system'] as const).map(mode => (
  <Pressable
    key={mode}
    onPress={() => {
      themeStore.setThemeMode(mode);
    }}
    android_ripple={{ color: colors.divider }}
    style={styles.themeRow}
  >
    <Text
      style={[
        styles.label,
        { color: colors.textPrimary },
      ]}
    >
      {mode === 'system'
        ? 'System Default'
        : mode.charAt(0).toUpperCase() +
          mode.slice(1)}
    </Text>

    <View style={styles.radioSlot}>
      <RadioIndicator
        selected={themeMode === mode}
      />
    </View>
  </Pressable>
))}
      </View>
    </View>
  );
};

/* =========================
   STATIC STYLES ONLY
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },

  card: {
    padding: 16,
    borderRadius: 12,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
  },

  value: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },

  action: {
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
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
  },

  save: {
    fontSize: 14,
    fontWeight: '600',
  },

  tickSlot: {
    width: 24,
    alignItems: 'flex-end',
  },
  
  tick: {
    fontSize: 16,      // ⬇ reduce from 18
    fontWeight: '700',
    lineHeight: 16,    // 🔑 prevents vertical expansion
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44, // 🔒 fixed height
  },
  
  radioSlot: {
    width: 24,
    alignItems: 'flex-end',
  },
  
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
