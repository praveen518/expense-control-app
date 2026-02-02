import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { expenseStore } from '../store/expense/expenseStore.instance';
import { pocketStore } from '../store/pocket/pocketStore.instance';
import { incomeStore } from '../store/income/incomeStore.instance';
import { balanceStore } from '../store/balance/balanceStore.instance';

import {
  currentMonthKey,
  shiftMonth,
} from '../utils/monthKey';

import { getHealthRank } from '../utils/pocketHealth';
import { formatINR } from '../utils/currency';
import { colors } from '../themes/colors';

/* Dashboard components */
import { BurnRateChip } from '../components/dashboard/BurnRateChip';
import { AttentionPockets } from '../components/dashboard/AttentionPockets';
import { PocketProgressList } from '../components/dashboard/PocketProgressList';
import { TopExpenses } from '../components/dashboard/TopExpenses';
import { useSalary } from '../hooks/useSettings';

export const DashboardScreen = ({ navigation }: any) => {
  /* =========================
     Month state
     ========================= */
  const [month, setMonth] = useState(
    currentMonthKey()
  );

  /* =========================
     Store subscriptions
     ========================= */

  const expenseSummary = useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    () => expenseStore.getDashboardSummary(month)
  );

  const pocketSummaries = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    () =>
      pocketStore.getAllPocketSummaries(month)
  );

  const topExpenses = useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    () =>
      expenseStore.getTopExpenseSummariesForMonth(
        month,
        3
      )
  );

  const incomeFromRecords = useSyncExternalStore(
    incomeStore.subscribe.bind(incomeStore),
    () =>
      incomeStore.getTotalIncomeForMonth(
        month
      )
  );

  const salary = useSalary();
  
  // Total income = income records + salary (for current/selected month)
  const totalIncome = incomeFromRecords + (salary || 0);

  const balance = useSyncExternalStore(
    balanceStore.subscribe.bind(balanceStore),
    balanceStore.getSnapshot.bind(balanceStore)
  );

  /* =========================
     Derived values (UI-only)
     ========================= */

  const totalSpent =
    expenseSummary.totalSpent;

  const remaining =
    totalIncome - totalSpent;

  const perDayAvailable =
    expenseSummary.daysRemaining > 0
      ? remaining /
        expenseSummary.daysRemaining
      : 0;

  const attentionPockets = pocketSummaries
    .map(
      ({
        pocket,
        allocated,
        remaining,
      }) => ({
        pocket,
        allocated,
        remaining,
        rank: getHealthRank(
          remaining,
          allocated
        ),
      })
    )
    .filter(item => item.rank < 3)
    .sort((a, b) => a.rank - b.rank);

  /* =========================
     Render
     ========================= */

  return (
    <View style={styles.container}>
      {/* =========================
          OVERALL BALANCE
         ========================= */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          Overall Balance
        </Text>
        <Text
          style={[
            styles.balanceValue,
            balance < 0 && styles.negative,
          ]}
        >
          {formatINR(balance)}
        </Text>
      </View>

      {/* =========================
          MONTH SWITCHER
         ========================= */}
      <View style={styles.monthRow}>
        <Pressable
          onPress={() =>
            setMonth(prev =>
              shiftMonth(prev, -1)
            )
          }
        >
          <Text style={styles.monthNav}>
            ◀
          </Text>
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
          <Text style={styles.monthNav}>
            ▶
          </Text>
        </Pressable>
      </View>

      {/* =========================
          MONTHLY SUMMARY
         ========================= */}
      <View style={styles.monthlyCard}>
        <View style={styles.row}>
          <Text style={styles.label}>
            Income
          </Text>
          <Text style={styles.positive}>
            {formatINR(totalIncome)}
          </Text>
          {/* <Pressable
            style={styles.addIncomeButton}
            onPress={() => navigation.navigate('AddIncome')}
          >
            <Text style={styles.addIncomeButtonText}>＋</Text>
          </Pressable> */}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Spent
          </Text>
          <Text style={styles.negative}>
            {formatINR(totalSpent)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Remaining
          </Text>
          <Text
            style={
              remaining < 0
                ? styles.negative
                : styles.positive
            }
          >
            {formatINR(remaining)}
          </Text>
        </View>
      </View>

      {/* =========================
          BURN RATE
         ========================= */}
      <BurnRateChip
        daysRemaining={
          expenseSummary.daysRemaining
        }
        perDayAvailable={perDayAvailable}
      />

      <TopExpenses items={topExpenses} />

      <AttentionPockets
        items={attentionPockets}
        onPressPocket={pocketId =>
          navigation.navigate(
            'PocketDetail',
            { pocketId }
          )
        }
      />

      <PocketProgressList
        pockets={pocketSummaries}
        onPressPocket={pocketId =>
          navigation.navigate(
            'PocketDetail',
            { pocketId }
          )
        }
      />
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

  /* Balance */
  balanceCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },

  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },

  /* Month switcher */
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

  /* Monthly card */
  monthlyCard: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.divider,
    marginVertical: 8,
  },

  positive: {
    color: colors.primary,
    fontWeight: '700',
  },

  negative: {
    color: colors.danger,
    fontWeight: '700',
  },
  /* Inline Add Income Button */
  addIncomeButton: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addIncomeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
});
