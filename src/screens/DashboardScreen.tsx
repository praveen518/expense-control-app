import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getPockets } from '../storage/pocketStorage';
import { Pocket } from '../types/pocket';
import { formatINR } from '../utils/currency';
import {
  getRemainingAmount,
  getHealthStatus,
} from '../utils/pocketHealth';

export const DashboardScreen = ({ navigation }: any) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getPockets();
      setPockets(data);
    };

    load();
  }, []);

  const attentionPockets = pockets.filter((p) => {
    const status = getHealthStatus(p);
    return status === 'critical' || status === 'warning';
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'safe':
        return '🟢 Safe';
      case 'warning':
        return '🟡 Almost used';
      case 'critical':
        return '🔴 Critical';
      case 'overspent':
        return '🔴 Over limit';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* ⚠️ Needs Attention */}
      {attentionPockets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚠️ Needs Attention ({attentionPockets.length})
          </Text>

          {attentionPockets.map((pocket) => (
            <Pressable
    key={pocket.id}
    style={styles.row}
    onPress={() =>
      navigation.navigate('PocketDetail', {
        pocketId: pocket.id,
      })
    }
  >
    <Text style={styles.name}>{pocket.name}</Text>
    <Text style={styles.amount}>
      {formatINR(getRemainingAmount(pocket))} left
    </Text>
  </Pressable>
          ))}
        </View>
      )}

      {/* 🩺 Pocket Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pocket Health</Text>

        {pockets.length === 0 ? (
          <Text style={styles.empty}>
            No pockets created yet
          </Text>
        ) : (
          pockets.map((pocket) => {
            const status = getHealthStatus(pocket);

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
    <Text style={styles.name}>{pocket.name}</Text>
    <Text>{getStatusLabel(status)}</Text>
  </Pressable>
            );
          })
        )}
      </View>
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
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  name: {
    fontSize: 15,
  },
  amount: {
    fontSize: 15,
    fontWeight: '500',
  },
  empty: {
    color: '#64748b',
    marginTop: 8,
  },
});
