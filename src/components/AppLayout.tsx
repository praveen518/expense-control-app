import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { AppHeader } from './AppHeader';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
