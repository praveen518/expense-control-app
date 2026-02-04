import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors } from '../../themes/colors';
import { formatINR } from '../../utils/currency';
import { getHealthLabel } from '../../utils/pocketHealth';

type AttentionPocket = {
  pocket: {
    id: string;
    name: string;
  };
  allocated: number;
  remaining: number;
};

type Props = {
  items: AttentionPocket[];
  onPressPocket: (pocketId: string) => void;
};

export function AttentionPockets({
  items,
  onPressPocket,
}: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ⚠️ Needs Attention ({items.length})
      </Text>

      {items.map(({ pocket, allocated, remaining }) => (
        <Pressable
          key={pocket.id}
          style={styles.row}
          onPress={() => onPressPocket(pocket.id)}
        >
          <View>
            <Text style={styles.name}>
              {pocket.name}
            </Text>
            <Text style={styles.health}>
              {getHealthLabel(remaining, allocated)}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              remaining < 0 && styles.negative,
            ]}
          >
            {formatINR(remaining)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  health: {
    fontSize: 12,
    color: colors.textMuted,
  },

  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  negative: {
    color: colors.danger,
  },
});
