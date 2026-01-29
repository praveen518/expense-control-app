import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { getExpenses } from '../storage/expenseStorage';
import { getOpeningBalance } from '../storage/openingBalanceStorage';
import { Pocket } from '../types/pocket';
import { Expense } from '../types/expense';
import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { getSpentForPocketInMonth } from '../utils/expenseMath';
import {
  getHealthLabel,
  getHealthRank,
} from '../utils/pocketHealth';

export const DashboardScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openingMap, setOpeningMap] =
    useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const pocketsData = await getPockets();
      const expensesData = await getExpenses();
      const month = getCurrentMonth();

      const openings: Record<string, number> = {};
      for (const pocket of pocketsData) {
        openings[pocket.id] = await getOpeningBalance(
          month,
          pocket.id
        );
      }

      setPockets(pocketsData);
      setExpenses(expensesData);
      setOpeningMap(openings);
    };

    load();
  }, []);

  const currentMonth = getCurrentMonth();

  // 🔥 Attention logic with severity sorting
  const attentionPockets = pockets
    .map((pocket) => {
      const spent = getSpentForPocketInMonth(
        expenses,
        pocket.id,
        currentMonth
      );

      const opening = openingMap[pocket.id] ?? 0;

      const remaining =
        pocket.allocated + opening - spent;

      return {
        pocket,
        remaining,
        rank: getHealthRank(
          remaining,
          pocket.allocated
        ),
      };
    })
    .filter((item) => item.rank < 3) // exclude safe
    .sort((a, b) => a.rank - b.rank);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* ⚠️ Attention Section */}
      {attentionPockets.length > 0 && (
        <View style={styles.attentionBox}>
          <Text style={styles.attentionTitle}>
            ⚠️ Needs Attention ({attentionPockets.length})
          </Text>

          {attentionPockets.map(
            ({ pocket, remaining }) => (
              <Pressable
                key={pocket.id}
                style={styles.attentionRow}
                onPress={() =>
                  navigation.navigate('PocketDetail', {
                    pocketId: pocket.id,
                  })
                }
              >
                <View>
                  <Text style={styles.name}>
                    {pocket.name}
                  </Text>
                  <Text style={styles.health}>
                    {getHealthLabel(
                      remaining,
                      pocket.allocated
                    )}
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
            )
          )}
        </View>
      )}

      {/* 📋 All Pockets */}
      {pockets.map((pocket) => {
        const spent = getSpentForPocketInMonth(
          expenses,
          pocket.id,
          currentMonth
        );

        const opening = openingMap[pocket.id] ?? 0;

        const remaining =
          pocket.allocated + opening - spent;

        return (
          <Pressable
            key={pocket.id}
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
                remaining < 0 && styles.negative,
              ]}
            >
              {formatINR(remaining)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },

  /* Attention */
  attentionBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  attentionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  attentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  health: {
    fontSize: 12,
    color: '#475569',
  },

  /* Common rows */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  negative: {
    color: '#dc2626',
  },
});
