import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { v4 as uuid } from 'uuid';

import { addIncomeWithBalance } from '../store/income/income.actions';
import { getCurrentMonth } from '../utils/month';
import { colors } from '../themes/colors';

export const AddIncomeScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const save = () => {
    const value = Number(amount.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(value) || value <= 0) return;

    const now = Date.now();

    addIncomeWithBalance({
      id: uuid(),
      amount: value,          // ALWAYS positive
      source: note || 'Income',
      month: getCurrentMonth(),
      date: now,
      createdAt: now,
      isDeleted: false,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Income</Text>

      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount received"
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Source / note (optional)"
        style={styles.input}
        placeholderTextColor={colors.textMuted}
      />

      <Pressable style={styles.button} onPress={save}>
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
    marginBottom: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
