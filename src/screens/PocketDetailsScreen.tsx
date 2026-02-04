import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { pocketStore } from '../store/pocket/pocketStore.instance';
import { transactionStore } from '../store/transaction/transactionStore.instance';

import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';

export const PocketDetailScreen = ({ route }: any) => {
  useThemeMode();
  const { pocketId } = route.params;
  const [addOpen, setAddOpen] = useState(false);
  const currentMonth = getCurrentMonth();

  const pockets = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    pocketStore.getSnapshot.bind(pocketStore)
  );

  const transactions = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getSnapshot.bind(transactionStore)
  );

  const pocket = pockets.find(p => p.id === pocketId);
  if (!pocket) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textMuted }}>
          Pocket not found
        </Text>
      </View>
    );
  }

  const pocketExpenses = transactions
    .filter(
      t =>
        !t.isDeleted &&
        t.type === 'expense' &&
        t.pocketId === pocketId &&
        t.month === currentMonth
    )
    .sort((a, b) => b.date - a.date);

  const spent = pocketExpenses.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const remaining = pocket.allocated - spent;

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 96,
        }}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceSoft },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            {pocket.name}
          </Text>

          <Text
            style={{ color: colors.textMuted }}
          >
            Allocated: {formatINR(pocket.allocated)}
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontWeight: '600',
              color:
                remaining < 0
                  ? colors.danger
                  : colors.primary,
            }}
          >
            Remaining: {formatINR(remaining)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.textMuted,
          }}
        >
          This month
        </Text>

        <View
          style={[
            styles.list,
            { backgroundColor: colors.surfaceSoft },
          ]}
        >
          {pocketExpenses.length === 0 ? (
            <Text
              style={{
                paddingVertical: 16,
                color: colors.textMuted,
              }}
            >
              No expenses yet
            </Text>
          ) : (
            pocketExpenses.map(e => (
              <View
                key={e.id}
                style={[
                  styles.row,
                  {
                    borderBottomColor:
                      colors.divider,
                  },
                ]}
              >
                <View>
                  <Text
                    style={{
                      fontWeight: '600',
                      color:
                        colors.textPrimary,
                    }}
                  >
                    {formatINR(
                      Math.abs(e.amount)
                    )}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        colors.textMuted,
                    }}
                  >
                    {e.source}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,
                      color:
                        colors.textMuted,
                    }}
                  >
                    {new Date(
                      e.date
                    ).toLocaleTimeString()}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    transactionStore.deleteTransaction(
                      e.id
                    )
                  }
                >
                  <Text
                    style={{
                      color:
                        colors.textMuted,
                      fontWeight: '600',
                    }}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => setAddOpen(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <AddExpenseModal
        visible={addOpen}
        pocketId={pocketId}
        month={currentMonth}
        onClose={() => setAddOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  list: {
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
  },
});
