import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
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

  /** NEW */
  mode?: 'full' | 'summary';
  maxItems?: number;
};

export const PocketProgressList = ({
  pockets,
  onPressPocket,
  mode = 'full',
  maxItems,
}: Props) => {
  const visiblePockets =
    mode === 'summary' && maxItems
      ? pockets.slice(0, maxItems)
      : pockets;

  if (visiblePockets.length === 0) return null;
  console.log('visiblePockets', visiblePockets);

  return (
    <View style={styles.container}>
      {visiblePockets.map(
        ({ pocket, allocated, remaining }) => {
          const spent = allocated - remaining;
          const percent =
            allocated > 0
              ? Math.min(
                  spent / allocated,
                  1
                )
              : 0;

          const percentLabel = Math.round(
            percent * 100
          );

          const progressColor =
            percentLabel > 85
              ? colors.danger
              : percentLabel > 60
              ? '#f59e0b'
              : colors.primary;

          return (
            <Pressable
              key={pocket.id}
              onPress={() =>
                onPressPocket(pocket.id)
              }
              style={styles.item}
            >
              <View style={styles.row}>
                <Text
                  style={[
                    styles.name,
                    { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {pocket.name}
                </Text>

                <Text
                  style={[
                    styles.percent,
                    { color: progressColor },
                  ]}
                >
                  {percentLabel}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentLabel}%`,
                      backgroundColor:
                        progressColor,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.subText,
                  { color: colors.textMuted },
                ]}
              >
                {formatINR(spent)} spent of{' '}
                {formatINR(allocated)}
              </Text>
            </Pressable>
          );
        }
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  item: {
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  percent: {
    fontSize: 13,
    fontWeight: '700',
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  subText: {
    fontSize: 12,
    marginTop: 4,
  },
});
