import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardStack } from './DashboardStack';
import { PocketsStack } from './PocketsStack';
import { ProfileStack } from './ProfileStack';
import { colors } from '../themes/colors';
import { useThemeMode } from '../store/settings/themeStore';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  useThemeMode(); // 🔑

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.surfaceSoft,
          borderTopColor: colors.divider,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="PocketsTab"
        component={PocketsStack}
        options={{ title: 'Pockets' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
