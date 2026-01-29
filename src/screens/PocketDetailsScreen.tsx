import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { getExpenses, addExpense } from '../storage/expenseStorage';
import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { formatINR } from '../utils/currency';

export const PocketDetailScreen = ({ route, navigation }: any) => {
  const { pocketId } = route.params;

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const load = async () => {
      const pockets = await getPockets();
      const expensesData = await getExpenses();

      const found = pockets.find((p) => p.id === pocketId);

      if (found) setPocket(found);
      setExpenses(expensesData);
    };

    load();
  }, [pocketId]);

  if (!pocket) return null;

  const currentMonth = getCurrentMonth();

  const spent = getSpentForPocketInMonth(
    expenses,
    pocket.id,
    currentMonth
  );

  const remaining = pocket.allocated - spent;

  const onAddExpense = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert('Enter a valid amount');
      return;
    }

    // ⚠️ Temporary hard block (will be removed in Debt step)
    if (value > remaining) {
      alert(
        `Expense exceeds remaining budget.\nAvailable: ${formatINR(
          remaining
        )}`
      );
      return;
    }

    await addExpense({
      id: Date.now().toString(),
      pocketId,
      amount: value,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pocket.name}</Text>
      <Text style={styles.sub}>
        Remaining: {formatINR(remaining)}
      </Text>

      <TextInput
        placeholder="Expense amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <Button title="Add Expense" onPress={onAddExpense} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  sub: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 16,
    borderRadius: 6,
  },
});
