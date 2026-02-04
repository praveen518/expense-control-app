import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { transactionStore } from '../store/transaction/transactionStore.instance';
import { pocketStore } from '../store/pocket/pocketStore.instance';

import {
  currentMonthKey,
  shiftMonth,
} from '../utils/monthKey';

import { colors } from '../themes/colors';
import { formatINR } from '../utils/currency';

/* =========================
   Screen
   ========================= */

export const TransactionsScreen = () => {
  const [month, setMonth] = useState(currentMonthKey());

  /* =========================
     🔐 LEGAL STORE SUBSCRIPTIONS
     ========================= */

  const transactions = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getSnapshot.bind(transactionStore)
  );

  const pocketSnapshot = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    pocketStore.getSnapshot.bind(pocketStore)
  );

  const pockets = pocketSnapshot;

  /* =========================
     Derived data (SAFE)
     ========================= */

  const activeTransactions = transactions
    .filter(
      t =>
        !t.isDeleted &&
        t.month === month
    )
    .sort((a, b) => b.date - a.date);

  const deletedTransactions = transactions
    .filter(
      t =>
        t.isDeleted &&
        t.month === month
    )
    .sort((a, b) => b.date - a.date);

  /* =========================
     Render helpers
     ========================= */

  const renderItem = ({ item }: any) => {
    const pocket =
      item.pocketId &&
      pockets.find(p => p.id === item.pocketId);

    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {item.source || item.category || 'Transaction'}
          </Text>
          <Text style={styles.sub}>
            {pocket?.name ?? '—'} •{' '}
            {new Date(item.date).toDateString()}
          </Text>
        </View>

        <Text
          style={[
            styles.amount,
            item.amount < 0
              ? styles.negative
              : styles.positive,
          ]}
        >
          {formatINR(Math.abs(item.amount))}
        </Text>
      </View>
    );
  };

  /* =========================
     Render
     ========================= */

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* MONTH SWITCHER */}
      <View style={styles.monthRow}>
        <Pressable
          onPress={() =>
            setMonth(prev =>
              shiftMonth(prev, -1)
            )
          }
        >
          <Text style={styles.monthNav}>◀</Text>
        </Pressable>

        <Text style={styles.monthText}>
          {month}
        </Text>

        <Pressable
          onPress={() =>
            setMonth(prev =>
              shiftMonth(prev, 1)
            )
          }
        >
          <Text style={styles.monthNav}>▶</Text>
        </Pressable>
      </View>

      {/* ACTIVE */}
      <Text style={styles.sectionTitle}>
        Transactions
      </Text>

      <FlatList
        data={activeTransactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No transactions this month
          </Text>
        }
      />

      {/* DELETED */}
      {deletedTransactions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Deleted
          </Text>

          <FlatList
            data={deletedTransactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
          />
        </>
      )}
    </View>
  );
};

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  monthNav: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  positive: {
    color: colors.primary,
  },
  negative: {
    color: colors.danger,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginVertical: 24,
  },
});
