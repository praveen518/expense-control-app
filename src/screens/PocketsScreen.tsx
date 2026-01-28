import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { Pocket } from '../types/pocket';
import { formatINR } from '../utils/currency';

export const PocketsScreen = () => {
  const [pockets, setPockets] = useState<Pocket[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getPockets();
      setPockets(data);
    };
    load();
  }, []);

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

  if (pockets.length === 0) {
    return <Text style={styles.empty}>No pockets created yet</Text>;
  }

  return (
    <FlatList
      data={pockets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
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
});
