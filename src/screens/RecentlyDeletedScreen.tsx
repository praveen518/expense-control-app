import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import { Expense } from '../types/expense';
import { useExpenses } from '../hooks/useExpenses';
import { expenseStore } from '../store/expense/expenseStore.instance';
import { formatINR } from '../utils/currency';

export const RecentlyDeletedScreen = () => {
  const expenses: Expense[] = useExpenses();

  const deletedExpenses = expenses.filter(e => e.deletedAt);

const groups = deletedExpenses.reduce<
  Record<string, Expense[]>
>((acc, expense) => {
  const date = new Date(expense.deletedAt!);
  const key = date.toDateString(); // grouping key

  if (!acc[key]) acc[key] = [];
  acc[key].push(expense);

  return acc;
}, {});

const sortedGroupKeys = Object.keys(groups).sort(
  (a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
);

const formatGroupTitle = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())
    return 'Today';

  if (date.toDateString() === yesterday.toDateString())
    return 'Yesterday';

  return date.toLocaleDateString();
};

  const confirmRestore = (expenseId: string) => {
    Alert.alert(
      'Restore expense',
      'Do you want to restore this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () =>
            expenseStore.restoreExpense(expenseId),
        },
      ]
    );
  };

  if (deletedExpenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>
          No recently deleted expenses
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedGroupKeys.map((groupKey) => (
  <View key={groupKey} style={styles.group}>
    <Text style={styles.groupTitle}>
      {formatGroupTitle(groupKey)}
    </Text>

    {groups[groupKey]
      .sort(
        (a, b) =>
          new Date(b.deletedAt!).getTime() -
          new Date(a.deletedAt!).getTime()
      )
      .map((item) => (
        <View key={item.id} style={styles.row}>
          <View>
            <Text style={styles.amount}>
              {formatINR(item.amount)}
            </Text>
            <Text style={styles.meta}>
              {new Date(item.deletedAt!).toLocaleTimeString()}
            </Text>
          </View>

          <Text
            style={styles.restore}
            onPress={() =>
              confirmRestore(item.id)
            }
          >
            Restore
          </Text>
        </View>
      ))}
  </View>
))}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6b7280',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
  },

  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  restore: {
    color: '#16a34a',
    fontWeight: '700',
    alignSelf: 'center',
  },
  group: {
  marginBottom: 24,
},

groupTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#374151',
  marginBottom: 8,
},
});
