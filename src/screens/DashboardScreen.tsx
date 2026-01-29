import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { getExpenses } from '../storage/expenseStorage';
import {
  getOpeningBalance,
} from '../storage/openingBalanceStorage';
import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';
import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { getHealthLabel } from '../utils/pocketHealth';

export const DashboardScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openingMap, setOpeningMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const p = await getPockets();
      const e = await getExpenses();
      const month = getCurrentMonth();

      const openings: Record<string, number> = {};
      for (const pocket of p) {
        openings[pocket.id] = await getOpeningBalance(
          month,
          pocket.id
        );
      }

      setPockets(p);
      setExpenses(e);
      setOpeningMap(openings);
    };

    load();
  }, []);

  const currentMonth = getCurrentMonth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {pockets.map((pocket) => {
        const spent = getSpentForPocketInMonth(
          expenses,
          pocket.id,
          currentMonth
        );

        const opening = openingMap[pocket.id] ?? 0;

        const remaining =
          pocket.allocated + opening - spent;

        return (
          <Pressable
            key={pocket.id}
            style={styles.row}
            onPress={() =>
              navigation.navigate('PocketDetail', {
                pocketId: pocket.id,
              })
            }
          >
            <Text style={styles.name}>
              {pocket.name}
            </Text>
            <View style={styles.right}>
  <Text
    style={[
      styles.amount,
      remaining < 0 && styles.negative,
    ]}
  >
    {formatINR(remaining)}
  </Text>
  <Text style={styles.health}>
    {getHealthLabel(remaining, pocket.allocated)}
  </Text>
</View>

          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  negative: {
    color: '#dc2626',
  },
  right: {
  alignItems: 'flex-end',
},
health: {
  fontSize: 12,
  marginTop: 2,
  color: '#64748b',
},

});
