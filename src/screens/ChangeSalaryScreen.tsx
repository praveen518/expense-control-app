import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { useSalary } from '../hooks/useSettings';
import { setSalary } from '../store/settingsStore';
import { colors } from '../themes/colors';

export const ChangeSalaryScreen = ({ navigation }: any) => {
  const salary = useSalary();
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput(String(salary || ''));
  }, [salary]);

  const onSave = async () => {
    const value = Number(input.replace(/[^0-9]/g, ''));

    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Please enter a valid salary');
      return;
    }

    await setSalary(value);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Salary</Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        keyboardType="numeric"
        placeholder="Enter monthly salary"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
