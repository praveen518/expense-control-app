import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { authLockStore } from '../auth/authLock.store';
import { colors } from '../themes/colors';

const PIN_LENGTH = 4;

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [' ', '0', '⌫'],
];

export const PinLockScreen = () => {
  const [pin, setPin] = useState<number[]>([]);
  const [isError, setIsError] = useState(false);

  const onDigitPress = (digit: number) => {
    if (pin.length >= PIN_LENGTH) return;

    const next = [...pin, digit];
    setPin(next);

    if (next.length === PIN_LENGTH) {
      verify(next);
    }
  };

  const verify = (entered: number[]) => {
    const ok = authLockStore.verifyPin(
      entered.join('')
    );

    if (!ok) {
      setIsError(true);
      setTimeout(() => {
        setPin([]);
        setIsError(false);
      }, 300);
    }
  };

  const onBackspace = () => {
    if (pin.length === 0) return;
    setPin(pin.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
  Welcome back
</Text>
      {/* PIN dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map(
          (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
                isError && styles.dotError,
              ]}
            />
          )
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYPAD_ROWS.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={styles.keypadRow}
          >
            {row.map((key) => {
              if (key === ' ') {
                return (
                  <View
                    key="empty"
                    style={styles.key}
                  />
                );
              }

              if (key === '⌫') {
                return (
                  <Key
                    key="backspace"
                    label="⌫"
                    onPress={onBackspace}
                  />
                );
              }

              return (
                <Key
                  key={key}
                  label={key}
                  onPress={() =>
                    onDigitPress(Number(key))
                  }
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Subtle reassurance */}
      <Text style={styles.hint}>
        Balances remain hidden after unlock
      </Text>
    </View>
  );
};

/* =========================
   Key component
   ========================= */

const Key = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.key,
      pressed && styles.keyPressed,
    ]}
  >
    <Text style={styles.keyText}>{label}</Text>
  </Pressable>
);

/* =========================
   Styles
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 14,
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },

  dotFilled: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },

  dotError: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },

  keypad: {
    alignItems: 'center',
  },

  keypadRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },

  key: {
    width: 72,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
  },

  keyPressed: {
    backgroundColor: colors.surface,
  },

  keyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  hint: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  welcome: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 12,
    color: colors.textMuted,
  },
});
