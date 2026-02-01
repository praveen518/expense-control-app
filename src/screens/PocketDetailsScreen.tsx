import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { pocketStore } from '../store/pocket/pocketStore.instance';
import { expenseStore } from '../store/expense/expenseStore.instance';

import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { colors } from '../themes/colors';

export const PocketDetailScreen = ({ route }: any) => {
  const { pocketId } = route.params;

  const [addOpen, setAddOpen] = useState(false);
  const currentMonth = getCurrentMonth();

  /* =========================
     Store subscriptions
     ========================= */

  const pocketSummary = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    () =>
      pocketStore.getPocketSummaryForMonth(
        pocketId,
        currentMonth
      )
  );

  const pocketExpenses = useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    () =>
      expenseStore.getExpensesForPocketInMonth(
        pocketId,
        currentMonth
      )
  );

  if (!pocketSummary) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          Pocket not found
        </Text>
      </View>
    );
  }

  const { pocket, allocated, remaining } =
    pocketSummary;

  const deleteExpense = (id: string) => {
    expenseStore.deleteExpense(id);
  };

  return (
    <View style={styles.screen}>
      {/* =========================
          Header
         ========================= */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {pocket.name}
        </Text>

        <Text style={styles.sub}>
          Allocated: {formatINR(allocated)}
        </Text>

        <Text
          style={[
            styles.remaining,
            remaining < 0
              ? styles.negative
              : styles.positive,
          ]}
        >
          Remaining: {formatINR(remaining)}
        </Text>
      </View>

      {/* =========================
          Expense list
         ========================= */}
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
                  {formatINR(Math.abs(e.amount))}
                </Text>

                {e.note && (
                  <Text style={styles.note}>
                    {e.note}
                  </Text>
                )}

                <Text style={styles.time}>
                  {new Date(e.date).toLocaleTimeString()}
                </Text>
              </View>

              <Text
                style={styles.delete}
                onPress={() =>
                  deleteExpense(e.id)
                }
              >
                Delete
              </Text>
            </View>
          ))
        )}
      </View>

      {/* =========================
          Add expense FAB
         ========================= */}
      <Pressable
        style={styles.fab}
        onPress={() => setAddOpen(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      {/* =========================
          Add expense modal
         ========================= */}
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
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  sub: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
  },

  remaining: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
  },

  positive: {
    color: colors.primary,
  },

  negative: {
    color: colors.danger,
  },

  list: {
    padding: 16,
  },

  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  delete: {
    color: colors.danger,
    fontWeight: '600',
    alignSelf: 'center',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  fabText: {
    color: '#ffffff',
    fontSize: 28,
    marginTop: -2,
  },
});
