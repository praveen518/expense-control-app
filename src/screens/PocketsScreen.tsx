import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

import { getPockets } from '../storage/pocketStorage';
import {
  getOpeningBalance,
} from '../storage/openingBalanceStorage';

import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';

import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';

import { useExpenses } from '../hooks/useExpenses';

export const PocketsScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [openingMap, setOpeningMap] =
    useState<Record<string, number>>({});

  // ✅ EXPENSES FROM STORE
  const expenses: Expense[] = useExpenses();

  useEffect(() => {
    const load = async () => {
      const p = await getPockets();
      const month = getCurrentMonth();

      const openings: Record<string, number> = {};
      for (const pocket of p) {
        openings[pocket.id] = await getOpeningBalance(
          month,
          pocket.id
        );
      }

      setPockets(p);
      setOpeningMap(openings);
    };

    const unsub = navigation.addListener('focus', load);
    load();

    return unsub;
  }, [navigation]);

  const renderItem = ({ item }: { item: Pocket }) => {
    const spent = getSpentForPocketInMonth(
      expenses,
      item.id,
      getCurrentMonth()
    );

    const opening = openingMap[item.id] ?? 0;

    const remaining =
      item.allocated + opening - spent;

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
        <Text
          style={[
            styles.amount,
            remaining < 0 && styles.negative,
          ]}
        >
          {formatINR(remaining)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('CreatePocket')
        }
      >
        <Text style={styles.addText}>
          + Create Pocket
        </Text>
      </Pressable>

      {pockets.length === 0 ? (
        <Text style={styles.empty}>
          No pockets created yet
        </Text>
      ) : (
        <FlatList
          data={pockets}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  addButton: { marginBottom: 12 },
  addText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  negative: {
    color: '#dc2626',
  },
  empty: {
    marginTop: 12,
    color: '#64748b',
  },
});
