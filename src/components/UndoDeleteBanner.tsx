import React, { useEffect, useRef }  from 'react';
import { Text, Pressable, StyleSheet, AccessibilityInfo,Animated, Easing  } from 'react-native';
import { useSyncExternalStore } from 'react';
import { expenseStore } from '../store/expense/expenseStore.instance';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function UndoDeleteBanner() {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(120)).current;
const opacity = useRef(new Animated.Value(0)).current;
const lastDeleted = expenseStore.getLastDeletedExpense();

  const canUndo  = useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    expenseStore.getCanUndoSnapshot.bind(expenseStore)
  );

  useEffect(() => {
  if (!canUndo) return;

  translateY.setValue(120);
  opacity.setValue(0);

  Animated.parallel([
    Animated.timing(translateY, {
      toValue: 0,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }),
  ]).start();
}, [canUndo, translateY, opacity]);


useEffect(() => {
  if (canUndo) {
    AccessibilityInfo.announceForAccessibility(
      'Expense deleted. Undo available.'
    );
  }
}, [canUndo]);

   if (!canUndo) {
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
  ₹{lastDeleted?.amount} deleted | {lastDeleted?.note}
</Text>

      <Pressable onPress={() => expenseStore.undoDelete()}>
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
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 14,
},
  text: {
    color: '#fff',
    fontSize: 14,
  },
  undo: {
    color: '#4da3ff',
    fontWeight: '600',
  },
});
