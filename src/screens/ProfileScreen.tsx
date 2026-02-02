import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { useSalary } from '../hooks/useSettings';
import { pocketStore } from '../store/pocket/pocketStore.instance';

import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';
import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { formatHiddenAmount } from '../utils/formatHiddenAmount';

export const ProfileScreen = ({ navigation }: any) => {
  useThemeMode();
  const isBalanceVisible = useBalanceVisibility();

  const salary = useSalary();
  const currentMonth = getCurrentMonth();

  const pocketSummaries = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    () =>
      pocketStore.getAllPocketSummaries(currentMonth)
  );

  const allocated = pocketSummaries.reduce(
    (sum, p) => sum + p.allocated,
    0
  );

  const remaining =
    typeof salary === 'number'
      ? salary - allocated
      : 0;

  const hasSalary =
    typeof salary === 'number' && salary > 0;

  return (
    <View style={styles.container}>
      {/* =========================
          Header
         ========================= */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage your money setup
        </Text>
      </View>

      {/* =========================
          Money Setup
         ========================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Monthly Setup
        </Text>

        <Text style={styles.salary}>
          {hasSalary
            ? formatHiddenAmount(salary, isBalanceVisible)
            : 'Salary not set'}
        </Text>


        {hasSalary && (
          <View style={styles.breakdown}>
            <View style={styles.row}>
              <Text style={styles.metaLabel}>
                Allocated to pockets
              </Text>
              <Text style={styles.metaValue}>
                {formatHiddenAmount(allocated, isBalanceVisible)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.metaLabel}>
                Remaining
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  remaining < 0
                    ? styles.negative
                    : styles.positive,
                ]}
              >
                {formatHiddenAmount(remaining, isBalanceVisible)}
              </Text>
            </View>
          </View>
        )}

        {!hasSalary && (
          <Pressable
            style={styles.inlineAction}
            onPress={() =>
              navigation.navigate('Settings')
            }
          >
            <Text style={styles.inlineActionText}>
              Set your salary →
            </Text>
          </Pressable>
        )}
      </View>

      {/* =========================
          Quick Actions
         ========================= */}
      <Text style={styles.sectionTitle}>
        Quick actions
      </Text>

      <View style={styles.list}>
        <Pressable
          style={styles.listRow}
          onPress={() =>
            navigation.navigate('AddIncome')
          }
        >
          <Text style={styles.listText}>
            Add Income
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          style={styles.listRow}
          onPress={() =>
            navigation.navigate('RecentlyDeleted')
          }
        >
          <Text style={styles.listText}>
            Recently Deleted
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      {/* =========================
          App Settings
         ========================= */}
      <Text style={styles.sectionTitle}>
        App
      </Text>

      <View style={styles.list}>
        <Pressable
          style={styles.listRow}
          onPress={() =>
            navigation.navigate('Settings')
          }
        >
          <Text style={styles.listText}>
            Settings
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
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

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },

  salary: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  breakdown: {
    marginTop: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  metaLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },

  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  positive: {
    color: colors.primary,
  },

  negative: {
    color: colors.danger,
  },

  inlineAction: {
    marginTop: 12,
  },

  inlineActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },

  list: {
    backgroundColor: colors.surfaceSoft,
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
    borderBottomColor: colors.divider,
  },

  listText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
});
