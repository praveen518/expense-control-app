import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
// import { v4 as uuid } from 'uuid';

// import { addIncomeWithBalance } from '../store/income/income.actions';
// import { getCurrentMonth } from '../utils/month';
import { addIncome } from
  '../store/transaction/transaction.action';

import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';

export const AddIncomeScreen = ({ navigation }: any) => {
  useThemeMode(); // 🔑 re-render on theme change

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const save = () => {
    const value = Number(
      amount.replace(/[^0-9]/g, '')
    );

    if (!Number.isFinite(value) || value <= 0)
      return;

    addIncome({
      amount: value,
      source: note || 'Income',
      date: new Date(),
    });

    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.textPrimary },
        ]}
      >
        Add Income
      </Text>

      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount received"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: colors.divider,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          },
        ]}
      />

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Source / note (optional)"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: colors.divider,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          },
        ]}
      />

      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.primary },
        ]}
        onPress={save}
      >
        <Text style={styles.buttonText}>
          Save
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },

  button: {
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
