import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

import { getPockets } from '../storage/pocketStorage';
import { getOpeningBalance } from '../storage/openingBalanceStorage';

import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';

import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import { formatINR } from '../utils/currency';

import { useExpenses } from '../hooks/useExpenses';
import { expenseStore } from '../store/expense/expenseStore.instance';

export const PocketDetailScreen = ({ route, navigation }: any) => {
  const { pocketId } = route.params;

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [opening, setOpening] = useState(0);
  const [amount, setAmount] = useState('');

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

  const onAddExpense = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert('Enter a valid amount');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      pocketId,
      amount: value,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    };

    await expenseStore.addExpense(expense);
    navigation.goBack();
  };

  const confirmDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            expenseStore.deleteExpense(expenseId),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {pocket.name}
        </Text>

        <Text
          style={[
            styles.remaining,
            remaining < 0 && styles.negative,
          ]}
        >
          Remaining: {formatINR(remaining)}
        </Text>

        <View style={styles.expenseList}>
          <Text style={styles.sectionTitle}>
            Expenses
          </Text>

          {pocketExpenses.length === 0 ? (
            <Text style={styles.empty}>
              No expenses yet
            </Text>
          ) : (
            pocketExpenses.map((e) => (
              <View
                key={e.id}
                style={styles.expenseRow}
              >
                <View>
                  <Text
                    style={styles.expenseAmount}
                  >
                    {formatINR(e.amount)}
                  </Text>
                  <Text style={styles.expenseDate}>
                    {new Date(
                      e.createdAt
                    ).toLocaleTimeString()}
                  </Text>
                </View>

                <Text
                  style={styles.delete}
                  onPress={() =>
                    confirmDeleteExpense(e.id)
                  }
                >
                  Delete
                </Text>
              </View>
            ))
          )}
        </View>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Expense amount"
          value={amount}
          onChangeText={setAmount}
        />

        <Button
          title="Add Expense"
          onPress={onAddExpense}
        />
      </View>

      {/* ✅ Snackbar-style Undo */}
      {expenseStore.canUndo() && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>
            Expense deleted
          </Text>
          <Text
            style={styles.snackbarAction}
            onPress={() =>
              expenseStore.undoDelete()
            }
          >
            UNDO
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  remaining: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '600',
  },

  negative: {
    color: '#dc2626',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 16,
    borderRadius: 6,
  },

  expenseList: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  empty: {
    color: '#6b7280',
  },

  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  expenseAmount: {
    fontSize: 15,
    fontWeight: '500',
  },

  expenseDate: {
    fontSize: 12,
    color: '#6b7280',
  },

  delete: {
    color: '#dc2626',
    fontWeight: '600',
    alignSelf: 'center',
  },

  /* 🔥 Snackbar styles */
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,

    backgroundColor: '#111827',
    borderRadius: 8,

    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  snackbarText: {
    color: '#f9fafb',
    fontSize: 14,
  },

  snackbarAction: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
    padding: 8,
  },
});
