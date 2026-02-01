import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';

type Kpi = {
  label: string;
  value: number;
  highlight?: 'positive' | 'negative';
};

type Props = {
  spent: number;
  remaining: number;
  avgPerDay: number;
};

export function KpiStrip({
  spent,
  remaining,
  avgPerDay,
}: Props) {
  const kpis: Kpi[] = [
    {
      label: 'Spent',
      value: spent,
      highlight: 'negative',
    },
    {
      label: 'Remaining',
      value: remaining,
      highlight: remaining < 0 ? 'negative' : 'positive',
    },
    {
      label: 'Avg / day',
      value: avgPerDay,
    },
  ];

  return (
    <View style={styles.container}>
      {kpis.map(kpi => (
        <View key={kpi.label} style={styles.card}>
          <Text style={styles.label}>{kpi.label}</Text>
          <Text
            style={[
              styles.value,
              kpi.highlight === 'positive' &&
                styles.positive,
              kpi.highlight === 'negative' &&
                styles.negative,
            ]}
          >
            {formatINR(kpi.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  card: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },

  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  positive: {
    color: colors.primary,
  },

  negative: {
    color: colors.danger,
  },
});
