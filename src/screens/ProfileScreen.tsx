import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getSalary } from '../storage/salaryStorage';
import { formatINR } from '../utils/currency';

export const ProfileScreen = ({ navigation }: any) => {
  const [salary, setSalary] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getSalary();
      if (data) setSalary(data.monthly);
    };
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Monthly Salary</Text>
      <Text style={styles.value}>
        {salary ? formatINR(salary) : 'Not set'}
      </Text>

    <Pressable onPress={() => navigation.navigate('Pockets')}>
        <Text style={styles.link}>View Pockets</Text>
    </Pressable>
      <Pressable onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.link}>Go to Settings</Text>
      </Pressable>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 28,
    marginBottom: 24,
  },
  link: {
    color: '#2563eb',
    fontSize: 16,
  },
});
