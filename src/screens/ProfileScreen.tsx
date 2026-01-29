import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getSalary } from '../storage/salaryStorage';
import { formatINR } from '../utils/currency';
import { getPockets } from '../storage/pocketStorage';
import { getTotalAllocated } from '../utils/salary';

export const ProfileScreen = ({ navigation }: any) => {
  const [salary, setSalary] = useState<number | null>(null);
    const [allocated, setAllocated] = useState(0);

  useEffect(() => {
    const load = async () => {
  const salaryData = await getSalary();
  const pockets = await getPockets();

  if (salaryData) {
    setSalary(salaryData.monthly);
    setAllocated(getTotalAllocated(pockets));
  }
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
      {salary !== null && (
  <>
    <Text style={styles.meta}>
      Allocated: {formatINR(allocated)}
    </Text>
    <Text style={styles.remaining}>
      Remaining: {formatINR(salary - allocated)}
    </Text>
  </>
)}

    <Pressable onPress={() => navigation.navigate('RecentlyDeleted')}>
        <Text style={styles.link}>Recently Deleted</Text>
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
  meta: {
  fontSize: 14,
  color: '#475569',
},
remaining: {
  fontSize: 16,
  fontWeight: '600',
  marginTop: 4,
},
});
