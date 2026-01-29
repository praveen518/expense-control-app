import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { getExpenses } from '../storage/expenseStorage';
import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';
import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { getHealthStatus } from '../utils/pocketHealth';

export const DashboardScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
      const pocketsData = await getPockets();
      const expensesData = await getExpenses();

      setPockets(pocketsData);
      setExpenses(expensesData);
    };

    load();
  }, []);

  const currentMonth = getCurrentMonth();

  const attentionPockets = pockets.filter((p) => {
    const spent = getSpentForPocketInMonth(
      expenses,
      p.id,
      currentMonth
    );
    const remaining = p.allocated - spent;
    const status = getHealthStatus({
      ...p,
      spent,
    });

    return status === 'critical' || status === 'warning';
  });

  const getStatusLabel = (remaining: number, allocated: number) => {
    const pct = remaining / allocated;

    if (pct < 0) return '🔴 Over limit';
    if (pct < 0.1) return '🔴 Critical';
    if (pct < 0.3) return '🟡 Almost used';
    return '🟢 Safe';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* ⚠️ Needs Attention */}
      {attentionPockets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚠️ Needs Attention ({attentionPockets.length})
          </Text>

          {attentionPockets.map((pocket) => {
            const spent = getSpentForPocketInMonth(
              expenses,
              pocket.id,
              currentMonth
            );
            const remaining = pocket.allocated - spent;

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
                <Text style={styles.name}>{pocket.name}</Text>
                <Text style={styles.amount}>
                  {formatINR(remaining)} left
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 🩺 Pocket Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pocket Health</Text>

        {pockets.length === 0 ? (
          <Text style={styles.empty}>
            No pockets created yet
          </Text>
        ) : (
          pockets.map((pocket) => {
            const spent = getSpentForPocketInMonth(
              expenses,
              pocket.id,
              currentMonth
            );
            const remaining = pocket.allocated - spent;

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
                <Text style={styles.name}>{pocket.name}</Text>
                <Text>
                  {getStatusLabel(
                    remaining,
                    pocket.allocated
                  )}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
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
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    color: '#64748b',
    marginTop: 8,
  },
});
