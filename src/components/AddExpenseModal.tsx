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
    const value = Number(amount);
    if (!value || value <= 0) return;

    onSubmit({
      id: Date.now().toString(),
      pocketId,
      amount: value,
      month,
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    });

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Expense</Text>

          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            autoFocus
          />

          <TextInput
            placeholder="Note (optional)"
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.note]}
            maxLength={100}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>

            <Pressable onPress={submit}>
              <Text style={styles.add}>Add</Text>
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
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    color: '#6b7280',
    fontSize: 16,
  },
  add: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
});
