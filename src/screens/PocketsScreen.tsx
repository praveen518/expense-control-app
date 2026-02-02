import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Animated,
} from 'react-native';
import { useSyncExternalStore } from 'react';

import { pocketStore } from '../store/pocket/pocketStore.instance';
import { formatINR } from '../utils/currency';
import { getCurrentMonth } from '../utils/month';
import { colors } from '../themes/colors';
import { showPocketActions } from '../utils/showPocketActions';
import { useThemeMode } from '../store/settings/themeStore';

type PocketSummary = {
  pocket: {
    id: string;
    name: string;
  };
  allocated: number;
  remaining: number;
};

/* =========================
   Pocket Row (HOOK SAFE)
   ========================= */
const PocketRow = ({
  item,
  navigation,
}: {
  item: PocketSummary;
  navigation: any;
}) => {
  const { pocket, allocated, remaining } = item;

  const spent = allocated - remaining;
  const percent =
    allocated > 0
      ? Math.min(spent / allocated, 1)
      : 0;

  const percentLabel = Math.round(percent * 100);

  const progressColor =
    remaining < 0
      ? colors.danger
      : percentLabel > 85
      ? colors.danger
      : percentLabel > 60
      ? '#f59e0b'
      : colors.primary;

  /* animation (VALID here) */
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentLabel,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [percentLabel]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      style={styles.item}
      onPress={() =>
        navigation.navigate('PocketDetail', {
          pocketId: pocket.id,
        })
      }
      onLongPress={() =>
        showPocketActions({
          onEdit: () =>
            navigation.navigate('EditPocket', {
              pocketId: pocket.id,
            }),
          onAdjust: () =>
            navigation.navigate(
              'AdjustPocketBudget',
              { pocketId: pocket.id }
            ),
          onDelete: () =>
            pocketStore.deletePocket(pocket.id),
        })
      }
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

        <View style={styles.right}>
          {remaining < 0 && (
            <Text style={styles.alert}>⚠︎</Text>
          )}
          <Text
            style={[
              styles.percent,
              { color: progressColor },
            ]}
          >
            {percentLabel}%
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: widthInterpolated,
              backgroundColor: progressColor,
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
        {formatINR(remaining)} remaining of{' '}
        {formatINR(allocated)}
      </Text>
    </Pressable>
  );
};

export const PocketsScreen = ({ navigation }: any) => {
  useThemeMode();

  const currentMonth = getCurrentMonth();

  const pocketSummaries = useSyncExternalStore(
    pocketStore.subscribe.bind(pocketStore),
    () => pocketStore.getAllPocketSummaries(currentMonth)
  );

  const [query, setQuery] = React.useState('');
  const [sortMode, setSortMode] =
    React.useState<'risk' | 'name'>('risk');

  const filteredPockets = useMemo(() => {
    const base = pocketSummaries.filter(p =>
      p.pocket.name
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (sortMode === 'name') {
      return [...base].sort((a, b) =>
        a.pocket.name.localeCompare(
          b.pocket.name
        )
      );
    }

    return [...base]
      .filter(p => p.allocated > 0)
      .sort((a, b) => {
        const aPct =
          (a.allocated - a.remaining) /
          a.allocated;
        const bPct =
          (b.allocated - b.remaining) /
          b.allocated;
        return bPct - aPct;
      });
  }, [pocketSummaries, query, sortMode]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Search + Sort */}
      <View style={styles.controls}>
        <TextInput
          placeholder="Search pockets"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[
            styles.search,
            {
              color: colors.textPrimary,
              borderColor: colors.divider,
            },
          ]}
        />

        <Pressable
          onPress={() =>
            setSortMode(m =>
              m === 'risk' ? 'name' : 'risk'
            )
          }
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: '600',
            }}
          >
            Sort: {sortMode === 'risk' ? 'Risk' : 'Name'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredPockets}
        keyExtractor={i => i.pocket.id}
        renderItem={({ item }) => (
          <PocketRow
            item={item}
            navigation={navigation}
          />
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky CTA */}
      <View
        style={[
          styles.sticky,
          { backgroundColor: colors.background },
        ]}
      >
        <Pressable
          onPress={() =>
            navigation.navigate('CreatePocket')
          }
        >
          <Text
            style={[
              styles.addText,
              { color: colors.primary },
            ]}
          >
            + Create Pocket
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  controls: {
    marginBottom: 12,
  },

  search: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  item: {
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  alert: {
    fontSize: 14,
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

  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  addText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
