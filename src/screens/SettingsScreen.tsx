import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export const SettingsScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Pressable onPress={() => navigation.navigate('ChangeSalary')}>
        <Text style={styles.item}>Change Salary</Text>
      </Pressable>
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
    marginBottom: 24,
  },
  item: {
    fontSize: 16,
    paddingVertical: 12,
    color: '#2563eb',
  },
});
