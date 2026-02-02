import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
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
import { useThemeMode } from '../store/settings/themeStore';

import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { privacyStore } from '../store/settings/privacyStore';
import { formatHiddenAmount } from '../utils/formatHiddenAmount';

export const DashboardScreen = ({ navigation }: any) => {
  useThemeMode();

  const isBalanceVisible = useBalanceVisibility();

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

  const incomeFromRecords = useSyncExternalStore(
    incomeStore.subscribe.bind(incomeStore),
    () =>
      incomeStore.getTotalIncomeForMonth(month)
  );

  const salary = useSalary();

  const totalIncome =
    incomeFromRecords + (salary || 0);

  const balance = useSyncExternalStore(
    balanceStore.subscribe.bind(balanceStore),
    balanceStore.getSnapshot.bind(balanceStore)
  );

  /* =========================
     Derived values
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

  const TOP_POCKETS = 3;

  const topUsagePockets =
    pocketSummaries
      .filter(p => p.allocated > 0)
      .sort((a, b) => {
        const aPct =
          (a.allocated - a.remaining) /
          a.allocated;
        const bPct =
          (b.allocated - b.remaining) /
          b.allocated;
        return bPct - aPct;
      })
      .slice(0, TOP_POCKETS);

  const hasMorePockets =
    pocketSummaries.length >
    TOP_POCKETS;

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
      {/* =========================
          OVERALL BALANCE
         ========================= */}
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
          <Text
            style={[
              styles.monthNav,
              { color: colors.primary },
            ]}
          >
            ◀
          </Text>
        </Pressable>

        <Text
          style={[
            styles.monthText,
            { color: colors.textPrimary },
          ]}
        >
          {month}
        </Text>

        <Pressable
          onPress={() =>
            setMonth(prev =>
              shiftMonth(prev, 1)
            )
          }
        >
          <Text
            style={[
              styles.monthNav,
              { color: colors.primary },
            ]}
          >
            ▶
          </Text>
        </Pressable>
      </View>

      {/* =========================
          MONTHLY SUMMARY
         ========================= */}
      <View
        style={[
          styles.monthlyCard,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              { color: colors.textMuted },
            ]}
          >
            Income
          </Text>
          <Text
            style={[
              styles.positive,
              { color: colors.primary },
            ]}
          >
            {formatINR(totalIncome)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              { color: colors.textMuted },
            ]}
          >
            Spent
          </Text>
          <Text
            style={[
              styles.negative,
              { color: colors.danger },
            ]}
          >
            {formatINR(totalSpent)}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: colors.divider },
          ]}
        />

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              { color: colors.textMuted },
            ]}
          >
            Remaining
          </Text>
          <Text
            style={[
              styles.positive,
              {
                color:
                  remaining < 0
                    ? colors.danger
                    : colors.primary,
              },
            ]}
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

      {/* =========================
          WHERE YOUR MONEY GOES
         ========================= */}
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
   Static Styles ONLY
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
    color: colors.textMuted,
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
  },

  monthNav: {
    fontSize: 18,
    fontWeight: '700',
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
  },

  divider: {
    height: 1,
    marginVertical: 8,
  },

  positive: {
    fontWeight: '700',
  },

  negative: {
    fontWeight: '700',
  },
});
