import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { expenseStore } from '../store/expense/expenseStore.instance';
import { formatINR } from '../utils/currency';
import { Expense } from '../types/expense';
import { colors } from '../themes/colors';

export const RecentlyDeletedScreen = () => {
  /* =========================
     Store subscription
     ========================= */

  const expenses = useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    expenseStore.getSnapshot.bind(expenseStore)
  );

  /* =========================
     Deleted expenses only
     ========================= */

  const deletedExpenses = expenses.filter(
    (e) => e.isDeleted && e.deletedAt
  );

  /* =========================
     Group by deleted date
     ========================= */

  const groups = deletedExpenses.reduce<
    Record<string, Expense[]>
  >((acc, expense) => {
    const date = new Date(expense.deletedAt!);
    const key = date.toDateString();

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

    if (
      date.toDateString() ===
      yesterday.toDateString()
    )
      return 'Yesterday';

    return date.toLocaleDateString();
  };

  /* =========================
     Actions
     ========================= */

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

          <View style={styles.groupCard}>
            {groups[groupKey]
              .sort(
                (a, b) =>
                  (b.deletedAt ?? 0) -
                  (a.deletedAt ?? 0)
              )
              .map((item) => (
                <View
                  key={item.id}
                  style={styles.row}
                >
                  <View>
                    <Text style={styles.amount}>
                      {formatINR(
                        Math.abs(item.amount)
                      )}
                    </Text>

                    <Text style={styles.meta}>
                      {new Date(
                        item.deletedAt!
                      ).toLocaleTimeString()}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      confirmRestore(item.id)
                    }
                  >
                    <Text style={styles.restore}>
                      Restore
                    </Text>
                  </Pressable>
                </View>
              ))}
          </View>
        </View>
      ))}
    </View>
  );
};

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
    fontSize: 14,
  },

  group: {
    marginBottom: 24,
  },

  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  groupCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  restore: {
    color: colors.primary,
    fontWeight: '700',
    alignSelf: 'center',
  },
});
