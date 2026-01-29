import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';

import { getPockets } from '../storage/pocketStorage';
import { getOpeningBalance } from '../storage/openingBalanceStorage';

import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { formatINR } from '../utils/currency';

import { useExpenses } from '../hooks/useExpenses';
import { expenseStore } from '../store/expense/expenseStore.instance';

import { AddExpenseModal } from '../components/AddExpenseModal';

export const PocketDetailScreen = ({ route }: any) => {
  const { pocketId } = route.params;

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [opening, setOpening] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const currentMonth = getCurrentMonth();

  // ✅ single source of truth
  const expenses: Expense[] = useExpenses();

  const pocketExpenses = expenses
    .filter(
      (e) =>
        e.pocketId === pocketId &&
        e.month === currentMonth &&
        !e.deletedAt
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  useEffect(() => {
    const load = async () => {
      const pockets = await getPockets();
      const found = pockets.find((p) => p.id === pocketId);

      const openingBalance = await getOpeningBalance(
        currentMonth,
        pocketId
      );

      if (found) setPocket(found);
      setOpening(openingBalance);
    };

    load();
  }, [pocketId, currentMonth]);

  if (!pocket) return null;

  const spent = getSpentForPocketInMonth(
    expenses,
    pocket.id,
    currentMonth
  );

  const remaining =
    pocket.allocated + opening - spent;

  const deleteExpense = (id: string) => {
    expenseStore.deleteExpense(id);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{pocket.name}</Text>

        <Text
          style={[
            styles.remaining,
            remaining < 0 && styles.negative,
          ]}
        >
          Remaining: {formatINR(remaining)}
        </Text>
      </View>

      {/* Expense List */}
      <View style={styles.list}>
        {pocketExpenses.length === 0 ? (
          <Text style={styles.empty}>
            No expenses yet
          </Text>
        ) : (
          pocketExpenses.map((e) => (
            <View key={e.id} style={styles.row}>
              <View>
                <Text style={styles.amount}>
                  {formatINR(e.amount)}
                </Text>

                {e.note && (
                  <Text style={styles.note}>
                    {e.note}
                  </Text>
                )}

                <Text style={styles.time}>
                  {new Date(e.createdAt).toLocaleTimeString()}
                </Text>
              </View>

              <Text
                style={styles.delete}
                onPress={() => deleteExpense(e.id)}
              >
                Delete
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => setAddOpen(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addOpen}
        pocketId={pocketId}
        month={currentMonth}
        onClose={() => setAddOpen(false)}
        onSubmit={(expense) =>
          expenseStore.addExpense(expense)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  remaining: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
  },

  negative: {
    color: '#dc2626',
  },

  list: {
    padding: 16,
  },

  empty: {
    color: '#6b7280',
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  amount: {
    fontSize: 15,
    fontWeight: '600',
  },

  note: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  delete: {
    color: '#dc2626',
    fontWeight: '600',
    alignSelf: 'center',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  fabText: {
    color: '#fff',
    fontSize: 28,
    marginTop: -2,
  },
});
