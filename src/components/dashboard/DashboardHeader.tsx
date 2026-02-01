import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';

type Props = {
  totalIncome: number;
  totalSpent: number;
  netAmount: number;
};

export function DashboardHeader({
  totalIncome,
  totalSpent,
  netAmount,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.amount, totalIncome > 0 && styles.positive]}>
          Income {formatINR(totalIncome)}
        </Text>

        <Text
          style={[
            styles.amount,
            netAmount < 0 ? styles.negative : styles.positive,
          ]}
        >
          Balance {formatINR(netAmount)}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          totalSpent > 0 && styles.negative,
        ]}
      >
        Spent {formatINR(totalSpent)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  positive: {
    color: colors.primary,
  },

  negative: {
    color: colors.danger,
  },
});
