import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { Pocket } from '../types/pocket';
import { pocketStore } from '../store/pocket/pocketStore.instance';
import { colors } from '../themes/colors';

export const CreatePocketScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const onSave = async () => {
    const allocated = Number(amount.replace(/[^0-9]/g, ''));

    if (!name.trim()) {
      Alert.alert('Pocket name is required');
      return;
    }

    if (!Number.isFinite(allocated) || allocated <= 0) {
      Alert.alert('Enter a valid amount');
      return;
    }

    const newPocket: Pocket = {
      id: Date.now().toString(),
      name: name.trim(),
      allocated,
      spent: 0,
    };

    await pocketStore.addPocket(newPocket);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Pocket</Text>

      <TextInput
        placeholder="Pocket name (e.g. Groceries)"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <TextInput
        placeholder="Allocated amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save Pocket</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // ✅ white, consistent
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.primary, // ✅ accent
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
