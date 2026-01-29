import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { getExpenses } from '../storage/expenseStorage';
import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';
import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';

export const PocketsScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
      const pocketsData = await getPockets();
      const expensesData = await getExpenses();

      setPockets(pocketsData);
      setExpenses(expensesData);
    };

    const unsubscribe = navigation.addListener('focus', load);
    load();

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: Pocket }) => {
    const spent = getSpentForPocketInMonth(
      expenses,
      item.id,
      getCurrentMonth()
    );

    const remaining = item.allocated - spent;

    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          navigation.navigate('PocketDetail', {
            pocketId: item.id,
          })
        }
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.amount}>
          {formatINR(remaining)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Create Pocket */}
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('CreatePocket')}
      >
        <Text style={styles.addText}>+ Create Pocket</Text>
      </Pressable>

      {pockets.length === 0 ? (
        <Text style={styles.empty}>
          No pockets created yet
        </Text>
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
  container: {
    padding: 16,
  },
  addButton: {
    marginBottom: 12,
  },
  addText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    marginTop: 12,
    color: '#64748b',
  },
});
