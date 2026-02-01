import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';

type TopExpense = {
  id: string;
  title: string;
  amount: number;
};

type Props = {
  items: TopExpense[];
};

export function TopExpenses({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Top expenses this month
      </Text>

      {items.map(item => (
        <View key={item.id} style={styles.row}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={styles.amount}>
            {formatINR(item.amount)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textPrimary,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  name: {
    fontSize: 14,
    color: colors.textPrimary,
    maxWidth: '70%',
  },

  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
});
