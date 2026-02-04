import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { transactionStore } from '../store/transaction/transactionStore.instance';
import { formatINR } from '../utils/currency';
import { colors } from '../themes/colors';

export const RecentlyDeletedScreen = () => {
  const transactions = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getSnapshot.bind(transactionStore)
  );

  const deleted = transactions.filter(
    t =>
      t.type === 'expense' &&
      t.isDeleted &&
      t.deletedAt
  );

  if (deleted.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>
          No recently deleted expenses
        </Text>
      </View>
    );
  }

  const confirmRestore = (id: string) => {
    Alert.alert(
      'Restore expense',
      'Do you want to restore this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () =>
            transactionStore.restoreTransactionById(
              id
            ),
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {deleted.map(item => (
        <View key={item.id} style={styles.row}>
          <View>
            <Text style={styles.amount}>
              {formatINR(Math.abs(item.amount))}
            </Text>
            <Text style={styles.meta}>
              {new Date(
                item.deletedAt!
              ).toLocaleTimeString()}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              confirmRestore(item.id)
            }
          >
            <Text style={styles.restore}>
              Restore
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  amount: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, color: colors.textMuted },
  restore: { fontWeight: '700', color: colors.primary },
});
