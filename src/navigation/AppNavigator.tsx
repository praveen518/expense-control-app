import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChangeSalaryScreen } from '../screens/ChangeSalaryScreen';
import { PocketsScreen } from '../screens/PocketsScreen';
import { CreatePocketScreen } from '../screens/CreatePocketScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PocketDetailScreen } from '../screens/PocketDetailsScreen';



const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // we use our own AppHeader
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangeSalary" component={ChangeSalaryScreen} />
        <Stack.Screen name="Pockets" component={PocketsScreen} />
        <Stack.Screen name="CreatePocket" component={CreatePocketScreen} />
        <Stack.Screen name="PocketDetail" component={PocketDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
