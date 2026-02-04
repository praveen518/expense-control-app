import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PocketDetailScreen } from '../screens/PocketDetailsScreen';
import { AddIncomeScreen } from '../screens/AddIncomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';

const Stack = createNativeStackNavigator();

export const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="PocketDetail"
        component={PocketDetailScreen}
        options={{ title: 'Pocket' }}
      />
      <Stack.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{ title: 'Add Income' }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
    </Stack.Navigator>
  );
};