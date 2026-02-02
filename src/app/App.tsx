// src/app/App.tsx
import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from '../navigation/AppNavigator';
import { UndoDeleteBanner } from '../components/UndoDeleteBanner';

import { openDB } from '../db/db';

import { expenseStore } from '../store/expense/expenseStore.instance';
import { pocketStore } from '../store/pocket/pocketStore.instance';
import { loadSettings } from '../store/settingsStore';
import { runMigrations } from '../db/migrations';
import { incomeStore } from '../store/income/incomeStore.instance';
import { balanceStore } from '../store/balance/balanceStore.instance';
import { themeStore, useThemeMode } from '../store/settings/themeStore';
import { resolveTheme } from '../themes/theme';

export default function App() {
  const [ready, setReady] = useState(false);

  const mode = useThemeMode();
  const theme = resolveTheme(mode);

  const navTheme = {
    dark: mode === 'dark',
    colors: {
      background: theme.background,
      card: theme.surfaceSoft,
      text: theme.textPrimary,
      border: theme.divider,
      primary: theme.primary,
      notification: theme.primary,
    },
  };

  useEffect(() => {
    async function bootstrap() {
      // 1️⃣ Settings (salary etc.)
      await loadSettings();

      // 2️⃣ Database + expenses
      openDB();
      await runMigrations();
      expenseStore.hydrateFromSQLite();
      pocketStore.hydrateFromSQLite();
      incomeStore.hydrateFromSQLite();
      await balanceStore.hydrate();
      await themeStore.hydrate();
      setReady(true);
    }

    bootstrap();
  }, []);

  if (!ready) {
    return null; // splash / loader if needed
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
        </NavigationContainer>

        <UndoDeleteBanner />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
});
