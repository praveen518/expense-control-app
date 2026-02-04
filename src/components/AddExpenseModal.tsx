import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { v4 as uuid } from 'uuid';

import { transactionStore } from '../store/transaction/transactionStore.instance';
import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';

export const AddExpenseModal = ({
  visible,
  pocketId,
  month,
  onClose,
}: any) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  useThemeMode();

  const submit = () => {
    const value = Number(
      amount.replace(/[^0-9]/g, '')
    );
    if (!Number.isFinite(value) || value <= 0)
      return;

    const now = Date.now();

    transactionStore.addTransaction({
      id: uuid(),
      type: 'expense',
      amount: -value,
      pocketId,
      source: note || 'Expense',
      month,
      date: now,
      createdAt: now,
      isDeleted: false,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <Pressable
        style={[
          styles.backdrop,
          {
            backgroundColor:
              colors.background + 'CC',
          },
        ]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.surfaceSoft },
          ]}
          onPress={() => {}}
        >
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            Add expense
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.input,
              {
                backgroundColor:
                  colors.surface,
                color: colors.textPrimary,
              },
            ]}
          />

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.input,
              {
                backgroundColor:
                  colors.surface,
                color: colors.textPrimary,
              },
            ]}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose}>
              <Text
                style={[
                  styles.cancel,
                  { color: colors.textMuted },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable onPress={submit}>
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
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* Only layout / spacing here */
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 20,
  },
  cancel: {
    fontWeight: '600',
  },
  save: {
    fontWeight: '700',
  },
});
