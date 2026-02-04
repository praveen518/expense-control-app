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

import {
  currentMonthKey,
  shiftMonth,
} from '../utils/monthKey';

import { getHealthRank } from '../utils/pocketHealth';
import { formatINR } from '../utils/currency';
import { colors } from '../themes/colors';

import { BurnRateChip } from '../components/dashboard/BurnRateChip';
import { AttentionPockets } from '../components/dashboard/AttentionPockets';
import { PocketProgressList } from '../components/dashboard/PocketProgressList';
import { TopExpenses } from '../components/dashboard/TopExpenses';

import { useSalary } from '../hooks/useSettings';
import { useThemeMode } from '../store/settings/themeStore';

import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { privacyStore } from '../store/settings/privacyStore';
import { formatHiddenAmount } from '../utils/formatHiddenAmount';

/* =========================
   Utils
   ========================= */

function getDaysRemaining(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number);
  const now = new Date();

  const isCurrent =
    now.getFullYear() === y &&
    now.getMonth() + 1 === m;

  if (!isCurrent) return 0;

  const lastDay = new Date(y, m, 0).getDate();
  return lastDay - now.getDate() + 1;
}

/* =========================
   Screen
   ========================= */

export const DashboardScreen = ({ navigation }: any) => {
  useThemeMode();

  const isBalanceVisible = useBalanceVisibility();
  const salary = useSalary();

  const [month, setMonth] = useState(currentMonthKey());

  /* =========================
     🔐 LEGAL STORE SUBSCRIPTIONS
     ========================= */

  const transactions = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getSnapshot.bind(transactionStore)
  );

  useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    pocketStore.getSnapshot.bind(pocketStore)
  );

  /* =========================
     Derived data (SAFE)
     ========================= */

  const pocketSummaries =
    pocketStore.getAllPocketSummaries(month);

  const incomeFromTransactions =
    transactionStore.getIncomeForMonth(month);

  const spentThisMonth =
    transactionStore.getExpenseForMonth(month);

  const balance =
    transactionStore.getBalanceForMonth(month);

  const totalIncome =
    incomeFromTransactions + (salary || 0);

  const daysRemaining = getDaysRemaining(month);

  const remainingBalance = balance;

  const perDayAvailable =
    daysRemaining > 0
      ? remainingBalance / daysRemaining
      : 0;

  const topExpenses = transactions
    .filter(
      t =>
        !t.isDeleted &&
        t.month === month &&
        t.amount < 0
    )
    .sort(
      (a, b) =>
        Math.abs(b.amount) - Math.abs(a.amount)
    )
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      title:
        t.source ||
        t.category ||
        'Expense',
      amount: Math.abs(t.amount),
    }));

  const attentionPockets = pocketSummaries
  .map(
    ({ pocket, allocated, remaining }) => ({
      pocket,
      allocated,
      remaining,
      rank: getHealthRank(remaining, allocated),
    })
  )
  .filter(item => item.rank < 3)
  .sort((a, b) => a.rank - b.rank);

  const TOP_POCKETS = 3;

  const topUsagePockets = pocketSummaries
  .filter(p => p.allocated > 0)
  .sort((a, b) => {
    const aPct =
      (a.allocated - a.remaining) / a.allocated;
    const bPct =
      (b.allocated - b.remaining) / b.allocated;
    return bPct - aPct;
  })
  .slice(0, 3);

  const hasMorePockets =
    pocketSummaries.length > TOP_POCKETS;

  /* =========================
     Render
     ========================= */

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* OVERALL BALANCE */}
      <View
        style={[
          styles.balanceCard,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Text
          style={[
            styles.balanceLabel,
            { color: colors.textMuted },
          ]}
        >
          Overall Balance
        </Text>

        <View style={styles.balanceValueRow}>
          <Text
            style={[
              styles.balanceValue,
              {
                color:
                  balance < 0
                    ? colors.danger
                    : colors.primary,
              },
            ]}
          >
            {formatHiddenAmount(
              balance,
              isBalanceVisible
            )}
          </Text>

          <Pressable
            onPress={privacyStore.toggle}
            hitSlop={8}
          >
            <Text style={styles.eye}>
              {isBalanceVisible ? '🙈' : '👁'}
            </Text>
          </Pressable>
        </View>
      </View>

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

      {/* MONTHLY SUMMARY */}
      <View
        style={[
          styles.monthlyCard,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.row}>
          <Text style={styles.label}>
            Income
          </Text>
          <Text style={styles.positive}>
            {formatINR(totalIncome)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Spent
          </Text>
          <Text style={styles.negative}>
            {formatINR(spentThisMonth)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Remaining
          </Text>
          <Text
            style={[
              styles.positive,
              {
                color:
                  remainingBalance < 0
                    ? colors.danger
                    : colors.primary,
              },
            ]}
          >
            {formatINR(remainingBalance)}
          </Text>
        </View>
      </View>

      {/* BURN RATE */}
      <BurnRateChip
        daysRemaining={daysRemaining}
        perDayAvailable={perDayAvailable}
      />

      <TopExpenses items={topExpenses} />

      <Pressable
        onPress={() =>
          navigation.navigate('Transactions')
        }
        style={{ alignSelf: 'flex-end', marginBottom: 16 }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          View all transactions →
        </Text>
      </Pressable>

      <AttentionPockets
        items={attentionPockets}
        onPressPocket={pocketId =>
          navigation.navigate(
            'PocketDetail',
            { pocketId }
          )
        }
      />

      {topUsagePockets.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textMuted,
              marginBottom: 12,
            }}
          >
            Where Your Money Goes
          </Text>

          <PocketProgressList
            pockets={topUsagePockets}
            mode="summary"
            maxItems={TOP_POCKETS}
            onPressPocket={pocketId =>
              navigation.navigate(
                'PocketDetail',
                { pocketId }
              )
            }
          />

          {hasMorePockets && (
            <Pressable
              onPress={() =>
                navigation.navigate(
                  'PocketsTab'
                )
              }
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                View all pockets →
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
};

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  eye: {
    fontSize: 18,
    opacity: 0.8,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
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
  monthlyCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: colors.divider,
  },
  positive: {
    fontWeight: '700',
    color: colors.primary,
  },
  negative: {
    fontWeight: '700',
    color: colors.danger,
  },
});
