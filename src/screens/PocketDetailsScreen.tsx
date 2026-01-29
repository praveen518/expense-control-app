import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { Pocket } from '../types/pocket';
import { getPockets, savePockets } from '../storage/pocketStorage';
import { addExpense } from '../storage/expenseStorage';
import { applyExpenseToPocket } from '../utils/pocketSpending';
import { getCurrentMonth } from '../utils/month';


export const PocketDetailScreen = ({ route, navigation }: any) => {
  const { pocketId } = route.params;

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const load = async () => {
      const pockets = await getPockets();
      const found = pockets.find((p) => p.id === pocketId);
      if (found) setPocket(found);
    };
    load();
  }, [pocketId]);

  const onAddExpense = async () => {
    const value = Number(amount);
    if (!value || value <= 0 || !pocket) {
      alert('Enter a valid amount');
      return;
    }

    // 1️⃣ Save expense
    await addExpense({
  id: Date.now().toString(),
  pocketId,
  amount: value,
  month: getCurrentMonth(),
  createdAt: new Date().toISOString(),
});

    // 2️⃣ Update pocket spent
    const pockets = await getPockets();
    const updated = applyExpenseToPocket(
      pockets,
      pocketId,
      value
    );

    await savePockets(updated);

    navigation.goBack();
  };

  if (!pocket) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pocket.name}</Text>
      <Text style={styles.sub}>
        Remaining: ₹{pocket.allocated - pocket.spent}
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 16,
    borderRadius: 6,
  },
});
