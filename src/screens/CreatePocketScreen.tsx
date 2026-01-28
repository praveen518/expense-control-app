import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { Pocket } from '../types/pocket';
import { getPockets, savePockets } from '../storage/pocketStorage';
import { getSalary } from '../storage/salaryStorage';

export const CreatePocketScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const getTotalAllocated = (pockets: Pocket[]) =>
    pockets.reduce((sum, p) => sum + p.allocated, 0);

  const onSave = async () => {
  const allocated = Number(amount);

  if (!name.trim()) {
    alert('Pocket name is required');
    return;
  }

  if (!allocated || allocated <= 0) {
    alert('Enter a valid amount');
    return;
  }

  const pockets = await getPockets();
  const salaryData = await getSalary();

  if (!salaryData) {
    alert('Please set your salary first');
    return;
  }

  const totalAllocated = pockets.reduce(
    (sum, p) => sum + p.allocated,
    0
  );

  const remaining = salaryData.monthly - totalAllocated;

  if (allocated > remaining) {
    alert(
        `Allocation exceeds remaining salary.\nAvailable: ₹${remaining}`
    );
    return;
  }

  const newPocket: Pocket = {
    id: Date.now().toString(),
    name: name.trim(),
    allocated,
    spent: 0,
  };

  await savePockets([...pockets, newPocket]);

  navigation.goBack();
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Pocket</Text>

      <TextInput
        placeholder="Pocket name (e.g. Groceries)"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Allocated amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Save Pocket" onPress={onSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
});
