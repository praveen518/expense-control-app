import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';

type Props = {
  daysRemaining: number;
  perDayAvailable: number;
};

export function BurnRateChip({
  daysRemaining,
  perDayAvailable,
}: Props) {
  if (daysRemaining <= 0) return null;

  const isNegative = perDayAvailable < 0;
  const isTight = perDayAvailable > 0 && perDayAvailable < 500;

  const backgroundColor = isNegative
    ? '#fee2e2'
    : isTight
    ? '#fef3c7'
    : '#ecfeff';

  const textColor = isNegative
    ? colors.danger
    : isTight
    ? '#b45309'
    : colors.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
        ]}
      >
        {daysRemaining} days left ·{' '}
        {formatINR(perDayAvailable)}/day
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },

  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
