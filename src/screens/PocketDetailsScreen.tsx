import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';

import { getPockets } from '../storage/pocketStorage';
import { getOpeningBalance } from '../storage/openingBalanceStorage';

import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';

import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { formatINR } from '../utils/currency';

import { useExpenses } from '../hooks/useExpenses';
import { expenseStore } from '../store/expense/expenseStore.instance';

export const PocketDetailScreen = ({ route, navigation }: any) => {
  const { pocketId } = route.params;

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [opening, setOpening] = useState(0);
  const [amount, setAmount] = useState('');

  // ✅ EXPENSES FROM STORE (single source of truth)
  const expenses: Expense[] = useExpenses();

  useEffect(() => {
    const load = async () => {
      const pockets = await getPockets();
      const found = pockets.find((p) => p.id === pocketId);

      const month = getCurrentMonth();
      const openingBalance = await getOpeningBalance(
        month,
        pocketId
      );

      if (found) setPocket(found);
      setOpening(openingBalance);
    };

    load();
  }, [pocketId]);

  if (!pocket) return null;

  const month = getCurrentMonth();

  const spent = getSpentForPocketInMonth(
    expenses,
    pocket.id,
    month
  );

  const remaining =
    pocket.allocated + opening - spent;

  const onAddExpense = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert('Enter a valid amount');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      pocketId,
      amount: value,
      month,
      createdAt: new Date().toISOString(),
    };

    // ✅ WRITE VIA STORE
    await expenseStore.addExpense(expense);

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {pocket.name}
      </Text>

      <Text
        style={[
          styles.remaining,
          remaining < 0 && styles.negative,
        ]}
      >
        Remaining: {formatINR(remaining)}
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Expense amount"
        value={amount}
        onChangeText={setAmount}
      />

      <Button title="Add Expense" onPress={onAddExpense} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  remaining: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  negative: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 16,
    borderRadius: 6,
  },
});
