import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from '../navigation/AppNavigator';
import { UndoDeleteBanner } from '../components/UndoDeleteBanner';
import { openDB } from '../db/db';
import { initExpenseDB } from '../db/schema';
import { migrateExpensesToSQLite } from '../storage/migrateExpensesToSQLite';
import { expenseStore } from '../store/expense/expenseStore.instance';

export default function App() {
  useEffect(() => {
    openDB();
    initExpenseDB();
    migrateExpensesToSQLite();
    expenseStore.hydrateFromSQLite();
  }, []);

  return (
    <SafeAreaProvider>
      {/* 🔑 This is the missing piece */}
      <View style={styles.root}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>

        {/* 🔴 Overlay that can actually be positioned */}
        <UndoDeleteBanner />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative', // 🚨 REQUIRED
  },
});
