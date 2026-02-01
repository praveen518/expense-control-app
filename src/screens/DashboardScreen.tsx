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

import {
  currentMonthKey,
  shiftMonth,
} from '../utils/monthKey';

import {
  getHealthRank,
} from '../utils/pocketHealth';

import { colors } from '../themes/colors';

/* Dashboard components */
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KpiStrip } from '../components/dashboard/KpiStrip';
import { BurnRateChip } from '../components/dashboard/BurnRateChip';
import { AttentionPockets } from '../components/dashboard/AttentionPockets';
import { PocketProgressList } from '../components/dashboard/PocketProgressList';
import { TopExpenses } from '../components/dashboard/TopExpenses';

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
    () => pocketStore.getAllPocketSummaries(month)
  );

  const topExpenses = useSyncExternalStore(
  expenseStore.subscribe.bind(expenseStore),
  () =>
    expenseStore.getTopExpenseSummariesForMonth(
      month,
      3
    )
);

  /* =========================
     Derived view data
     ========================= */

  const attentionPockets = pocketSummaries
    .map(({ pocket, allocated, remaining }) => ({
      pocket,
      allocated,
      remaining,
      rank: getHealthRank(remaining, allocated),
    }))
    .filter(item => item.rank < 3)
    .sort((a, b) => a.rank - b.rank);

  /* =========================
     Render
     ========================= */

  return (
    <View style={styles.container}>
      {/* =========================
          Month switcher
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
          Header
         ========================= */}
      <DashboardHeader
        totalIncome={expenseSummary.totalIncome}
        totalSpent={expenseSummary.totalSpent}
        netAmount={expenseSummary.netAmount}
      />

      {/* =========================
          KPI strip
         ========================= */}
      <KpiStrip
        spent={expenseSummary.totalSpent}
        remaining={expenseSummary.netAmount}
        avgPerDay={expenseSummary.avgPerDay}
      />

      {/* =========================
          Burn rate
         ========================= */}
      <BurnRateChip
        daysRemaining={
          expenseSummary.daysRemaining
        }
        perDayAvailable={
          expenseSummary.perDayAvailable
        }
      />

      <TopExpenses items={topExpenses} />

      {/* =========================
          Needs attention
         ========================= */}
      <AttentionPockets
        items={attentionPockets}
        onPressPocket={pocketId =>
          navigation.navigate(
            'PocketDetail',
            { pocketId }
          )
        }
      />

      {/* =========================
          Pockets
         ========================= */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  /* Month switcher */
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
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
});
