import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { Pocket } from '../types/pocket';
import { formatINR } from '../utils/currency';
import { getSalary } from '../storage/salaryStorage';
import { getRemainingSalary } from '../utils/salary';


export const PocketsScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);


  useEffect(() => {
  const load = async () => {
  const pocketsData = await getPockets();
  const salaryData = await getSalary();

  setPockets(pocketsData);

  if (salaryData) {
    setRemaining(
      getRemainingSalary(salaryData.monthly, pocketsData)
    );
  }
};


  const unsubscribe = navigation.addListener('focus', load);
  return unsubscribe;
}, [navigation]);

  const renderItem = ({ item }: { item: Pocket }) => {
    const remaining = item.allocated - item.spent;

    return (
      <View style={styles.pocket}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.amount}>
          {formatINR(remaining)} left
        </Text>
      </View>
    );
  };

  return (
  <View>
    {remaining !== null && (
  <Text style={styles.remainingBanner}>
    Remaining to allocate: {formatINR(remaining)}
  </Text>
)}

    <Pressable
      style={styles.addButton}
      onPress={() => navigation.navigate('CreatePocket')}
    >
      <Text style={styles.addText}>+ Create Pocket</Text>
    </Pressable>

    {pockets.length === 0 ? (
      <Text style={styles.empty}>No pockets created yet</Text>
    ) : (
      <FlatList
        data={pockets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    )}
  </View>
);
};

const styles = StyleSheet.create({
  pocket: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    marginTop: 4,
    color: '#475569',
  },
  empty: {
    padding: 16,
    color: '#64748b',
  },
  addButton: {
  padding: 12,
  marginBottom: 12,
},
addText: {
  color: '#2563eb',
  fontSize: 16,
},
remainingBanner: {
  marginBottom: 8,
  color: '#0f172a',
  fontWeight: '600',
},

});
