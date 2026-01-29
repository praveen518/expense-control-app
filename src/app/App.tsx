import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../navigation/AppNavigator';
import { expenseStore } from '../store/expense/expenseStore.instance';
import { initExpenseDB } from '../storage/expenseSQLite';
import { migrateExpensesToSQLite } from '../storage/migrateExpensesToSQLite';

export default function App() {
  useEffect(() => {
  try {
    console.log('1️⃣ initExpenseDB');
    initExpenseDB();

    console.log('2️⃣ migrateExpensesToSQLite');
    migrateExpensesToSQLite().then(() => {
      expenseStore.init();
    });
  } catch (e) {
    console.error('❌ App bootstrap failed', e);
  }
}, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
