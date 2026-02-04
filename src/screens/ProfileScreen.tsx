import React, { useMemo } from 'react';
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

import { getCurrentMonth } from '../utils/month';
import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';
import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { formatHiddenAmount } from '../utils/formatHiddenAmount';
import { Logo } from '../components/Logo';

export const ProfileScreen = ({ navigation }: any) => {
  useThemeMode();
  const isBalanceVisible = useBalanceVisibility();

  const currentMonth = getCurrentMonth();

  /* =========================
     Raw store snapshots (SAFE)
     ========================= */

  const pockets = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    pocketStore.getSnapshot.bind(pocketStore)
  );

  const transactions = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getSnapshot.bind(transactionStore)
  );

  /* =========================
     Derived values
     ========================= */

  const salaryIncome = useMemo(() => {
    return transactions.reduce(
      (sum, t) =>
        !t.isDeleted &&
        t.month === currentMonth &&
        t.source === 'Salary'
          ? sum + t.amount
          : sum,
      0
    );
  }, [transactions, currentMonth]);

  const allocated = useMemo(() => {
    return pockets.reduce(
      (sum, p) => sum + p.allocated,
      0
    );
  }, [pockets]);

  const hasSalary = salaryIncome > 0;
  const remaining = salaryIncome - allocated;

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
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.logoWrap}>
          <Logo size={48} />
        </View>

        <View>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.textPrimary },
            ]}
          >
            Financial Profile
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.textMuted },
            ]}
          >
            {currentMonth} • Budget & setup
          </Text>
        </View>
      </View>

      {/* Monthly Setup */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSoft },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.textMuted },
          ]}
        >
          Monthly Setup
        </Text>

        <Text
          style={[
            styles.salary,
            { color: colors.textPrimary },
          ]}
        >
          {hasSalary
            ? formatHiddenAmount(
                salaryIncome,
                isBalanceVisible
              )
            : 'Salary not set'}
        </Text>

        {hasSalary ? (
          <View style={styles.breakdown}>
            <View style={styles.row}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: colors.textMuted },
                ]}
              >
                Allocated to pockets
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: colors.textPrimary },
                ]}
              >
                {formatHiddenAmount(
                  allocated,
                  isBalanceVisible
                )}
              </Text>
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  styles.metaLabel,
                  { color: colors.textMuted },
                ]}
              >
                Unallocated
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  {
                    color:
                      remaining < 0
                        ? colors.danger
                        : colors.primary,
                  },
                ]}
              >
                {formatHiddenAmount(
                  remaining,
                  isBalanceVisible
                )}
              </Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.inlineAction}
            onPress={() =>
              navigation.navigate('Settings')
            }
          >
            <Text
              style={[
                styles.inlineActionText,
                { color: colors.primary },
              ]}
            >
              Set salary to unlock insights →
            </Text>
          </Pressable>
        )}
      </View>

      {/* Quick Insights */}
      {hasSalary && (
        <View
          style={[
            styles.insightCard,
            { backgroundColor: colors.surfaceSoft },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: colors.textMuted },
            ]}
          >
            This Month
          </Text>

          <View style={styles.row}>
            <Text
              style={[
                styles.metaLabel,
                { color: colors.textMuted },
              ]}
            >
              Allocated
            </Text>
            <Text
              style={[
                styles.metaValue,
                { color: colors.textPrimary },
              ]}
            >
              {formatHiddenAmount(
                allocated,
                isBalanceVisible
              )}
            </Text>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.metaLabel,
                { color: colors.textMuted },
              ]}
            >
              Unallocated
            </Text>
            <Text
              style={[
                styles.metaValue,
                {
                  color:
                    remaining < 0
                      ? colors.danger
                      : colors.primary,
                },
              ]}
            >
              {formatHiddenAmount(
                remaining,
                isBalanceVisible
              )}
            </Text>
          </View>
        </View>
      )}

      {/* Money Actions */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textMuted },
        ]}
      >
        Money
      </Text>

      <View
        style={[
          styles.list,
          { backgroundColor: colors.surfaceSoft },
        ]}
      >
        <Pressable
          style={[
            styles.listRow,
            { borderBottomColor: colors.divider },
          ]}
          onPress={() =>
            navigation.navigate('AddIncome')
          }
        >
          <Text
            style={[
              styles.listText,
              { color: colors.textPrimary },
            ]}
          >
            Add income
          </Text>
          <Text
            style={[
              styles.chevron,
              { color: colors.textMuted },
            ]}
          >
            ›
          </Text>
        </Pressable>

        <Pressable
          style={styles.listRow}
          onPress={() =>
            navigation.navigate('RecentlyDeleted')
          }
        >
          <Text
            style={[
              styles.listText,
              { color: colors.textPrimary },
            ]}
          >
            Recently deleted
          </Text>
          <Text
            style={[
              styles.chevron,
              { color: colors.textMuted },
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>

      {/* App */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.textMuted },
        ]}
      >
        App
      </Text>

      <View
        style={[
          styles.list,
          { backgroundColor: colors.surfaceSoft },
        ]}
      >
        <Pressable
          style={styles.listRow}
          onPress={() =>
            navigation.navigate('Settings')
          }
        >
          <Text
            style={[
              styles.listText,
              { color: colors.textPrimary },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.chevron,
              { color: colors.textMuted },
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

/* =========================
   Styles (unchanged)
   ========================= */

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logoWrap: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  insightCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  salary: {
    fontSize: 28,
    fontWeight: '700',
  },
  breakdown: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  inlineAction: {
    marginTop: 12,
  },
  inlineActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    borderRadius: 12,
    marginBottom: 20,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
  },
});
