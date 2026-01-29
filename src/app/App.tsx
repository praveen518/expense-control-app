import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../navigation/AppNavigator';
import { expenseStore } from "../store/expense/expenseStore.instance";

export default function App() {
  useEffect(() => {
  expenseStore.init();
}, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
