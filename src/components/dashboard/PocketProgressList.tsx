import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';

type PocketSummary = {
  pocket: {
    id: string;
    name: string;
  };
  allocated: number;
  remaining: number;
};

type Props = {
  pockets: PocketSummary[];
  onPressPocket: (pocketId: string) => void;
};

export function PocketProgressList({
  pockets,
  onPressPocket,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pockets</Text>

      {pockets.map(({ pocket, allocated, remaining }) => {
        const spent = allocated - remaining;
        const ratio =
          allocated > 0 ? spent / allocated : 0;
        const clamped = Math.min(Math.max(ratio, 0), 1);

        const barColor =
          ratio >= 1
            ? colors.danger
            : ratio >= 0.75
            ? '#f59e0b'
            : colors.primary;

        return (
          <Pressable
            key={pocket.id}
            style={styles.row}
            onPress={() => onPressPocket(pocket.id)}
          >
            <View style={styles.rowTop}>
              <Text style={styles.name}>
                {pocket.name}
              </Text>
              <Text
                style={[
                  styles.amount,
                  remaining < 0 && styles.negative,
                ]}
              >
                {formatINR(remaining)}
              </Text>
            </View>

            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${clamped * 100}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.textPrimary,
  },

  row: {
    marginBottom: 14,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  name: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  negative: {
    color: colors.danger,
  },

  barBackground: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
