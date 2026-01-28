import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { getSalary, saveSalary } from '../storage/salaryStorage';

export const ChangeSalaryScreen = ({ navigation }: any) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalary = async () => {
      const data = await getSalary();
      if (data) {
        setInput(String(data.monthly));
      }
      setLoading(false);
    };

    loadSalary();
  }, []);

  const onSave = async () => {
    const value = Number(input);

    if (!value || value <= 0) {
      alert('Please enter a valid salary');
      return;
    }

    await saveSalary({
      monthly: value,
      updatedAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Salary</Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        keyboardType="numeric"
        placeholder="Enter monthly salary"
        style={styles.input}
      />

      <Button title="Save" onPress={onSave} />
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
  loading: {
    padding: 16,
  },
});
