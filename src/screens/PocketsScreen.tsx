import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { pocketStore } from '../store/pocket/pocketStore.instance';

import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { colors } from '../themes/colors';

export const PocketsScreen = ({ navigation }: any) => {
  /* =========================
     Month context
     ========================= */

  const currentMonth = getCurrentMonth();

  /* =========================
     Store subscription
     ========================= */

  const pocketSummaries = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    () => pocketStore.getAllPocketSummaries(currentMonth)
  );

  /* =========================
     Render
     ========================= */

  const renderItem = ({
    item,
  }: {
    item: {
      pocket: { id: string; name: string };
      remaining: number;
    };
  }) => {
    const { pocket, remaining } = item;

    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          navigation.navigate('PocketDetail', {
            pocketId: pocket.id,
          })
        }
      >
        <Text style={styles.name}>
          {pocket.name}
        </Text>

        <Text
          style={[
            styles.amount,
            remaining < 0
              ? styles.negative
              : styles.positive,
          ]}
        >
          {formatINR(remaining)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('CreatePocket')
        }
      >
        <Text style={styles.addText}>
          + Create Pocket
        </Text>
      </Pressable>

      {pocketSummaries.length === 0 ? (
        <Text style={styles.empty}>
          No pockets created yet
        </Text>
      ) : (
        <FlatList
          data={pocketSummaries}
          keyExtractor={(i) => i.pocket.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // ✅ explicit white
    padding: 16,
  },

  addButton: {
    marginBottom: 12,
  },

  addText: {
    color: colors.primary, // ✅ accent CTA
    fontSize: 16,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  amount: {
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

  empty: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
  },
});
