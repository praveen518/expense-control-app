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

export const ProfileScreen = ({ navigation }: any) => {
  const salary = useSalary();
  const currentMonth = getCurrentMonth();

  /* =========================
     Pocket allocations (SSOT)
     ========================= */

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
    salary !== null ? salary - allocated : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          Monthly Salary
        </Text>

        <Text style={styles.salary}>
          {typeof salary === 'number' && salary > 0
            ? formatINR(salary)
            : 'Not set'}
        </Text>

        {typeof salary === 'number' && salary > 0 && (
  <View style={styles.breakdown}>
    <View style={styles.row}>
      <Text style={styles.metaLabel}>
        Allocated to pockets
      </Text>
      <Text style={styles.metaValue}>
        {formatINR(allocated)}
      </Text>
    </View>

    <View style={styles.row}>
      <Text style={styles.metaLabel}>
        Remaining
      </Text>
      <Text
        style={[
          styles.remaining,
          remaining < 0
            ? styles.negative
            : styles.positive,
        ]}
      >
        {formatINR(remaining)}
      </Text>
    </View>
  </View>
)}

      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionRow}
          onPress={() =>
            navigation.navigate('AddIncome')
          }
        >
          <Text style={styles.actionText}>
            Add Income
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionRow}
          onPress={() =>
            navigation.navigate('RecentlyDeleted')
          }
        >
          <Text style={styles.actionText}>
            Recently Deleted
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionRow}
          onPress={() =>
            navigation.navigate('Settings')
          }
        >
          <Text style={styles.actionText}>
            Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  cardLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },

  salary: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  remaining: {
    fontSize: 16,
    fontWeight: '700',
  },

  positive: {
    color: colors.primary,
  },

  negative: {
    color: colors.danger,
  },

  actions: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  actionRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
});
