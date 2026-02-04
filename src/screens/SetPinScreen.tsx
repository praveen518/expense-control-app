import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

import { authLockStore } from '../auth/authLock.store';
import { colors } from '../themes/colors';

export const SetPinScreen = () => {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (pin !== confirm) {
      setError('PINs do not match');
      return;
    }
    authLockStore.setPin(pin);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set App PIN</Text>

      <TextInput
        secureTextEntry
        keyboardType="number-pad"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter PIN"
        style={styles.input}
      />

      <TextInput
        secureTextEntry
        keyboardType="number-pad"
        maxLength={4}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Confirm PIN"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Set PIN</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
