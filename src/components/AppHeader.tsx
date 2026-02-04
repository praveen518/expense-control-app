import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AppHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Expense Control</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
