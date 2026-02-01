import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Expense } from '../types/expense';
import { colors } from '../themes/colors';

interface Props {
  visible: boolean;
  pocketId: string;
  month: string;
  onClose: () => void;
  onSubmit: (expense: Expense) => void;
}

export function AddExpenseModal({
  visible,
  pocketId,
  month,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const submit = () => {
    const value = Number(
      amount.replace(/[^0-9]/g, '')
    );

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    const now = Date.now();

    const expense: Expense = {
      id: now.toString(),
      pocketId,
      amount: -value, // 🔴 expense = negative
      month,
      date: now,
      createdAt: now,
      isDeleted: false,
      note: note.trim() || undefined,
    };

    onSubmit(expense);

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>
            Add Expense
          </Text>

          <TextInput
            placeholder="Amount"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            autoFocus
          />

          <TextInput
            placeholder="Note (optional)"
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.note]}
            maxLength={100}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>
                Cancel
              </Text>
            </Pressable>

            <Pressable onPress={submit}>
              <Text style={styles.add}>
                Add
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  sheet: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },

  note: {
    fontSize: 14,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },

  cancel: {
    color: colors.textMuted,
    fontSize: 16,
  },

  add: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
