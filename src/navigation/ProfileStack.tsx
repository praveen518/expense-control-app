import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChangeSalaryScreen } from '../screens/ChangeSalaryScreen';
import { RecentlyDeletedScreen } from '../screens/RecentlyDeletedScreen';
import { AddIncomeScreen } from '../screens/AddIncomeScreen';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
  name="RecentlyDeleted"
  component={RecentlyDeletedScreen}
  options={{ title: 'Recently Deleted' }}
/>
      <Stack.Screen
        name="ChangeSalary"
        component={ChangeSalaryScreen}
        options={{ title: 'Change Salary' }}
      />
      <Stack.Screen
  name="AddIncome"
  component={AddIncomeScreen}
/>

    </Stack.Navigator>
  );
};
