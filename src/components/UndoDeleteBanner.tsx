import React, { useEffect, useRef } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
  Animated,
  Easing,
} from 'react-native';
import { useSyncExternalStore } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { transactionStore } from '../store/transaction/transactionStore.instance';

export function UndoDeleteBanner() {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ✅ SINGLE SOURCE OF TRUTH (TransactionStore)
  const { canUndo, lastDeleted } = useSyncExternalStore(
    transactionStore.subscribe.bind(transactionStore),
    transactionStore.getUndoSnapshot.bind(transactionStore)
  );

  useEffect(() => {
    if (!canUndo) return;

    translateY.setValue(120);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [canUndo, opacity, translateY]);

  useEffect(() => {
    if (canUndo) {
      AccessibilityInfo.announceForAccessibility(
        'Transaction deleted. Undo available.'
      );
    }
  }, [canUndo]);

  if (!canUndo || !lastDeleted) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 12,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>
        ₹{Math.abs(lastDeleted.amount)} deleted
        {lastDeleted.source
          ? ` | ${lastDeleted.source}`
          : ''}
      </Text>

      <Pressable
        onPress={() =>
          transactionStore.undoDelete()
        }
      >
        <Text style={styles.undo}>UNDO</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,

    backgroundColor: '#111827',
    borderRadius: 10,

    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  text: {
    color: '#ffffff',
    fontSize: 14,
    flexShrink: 1,
    marginRight: 12,
  },

  undo: {
    color: '#4da3ff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
