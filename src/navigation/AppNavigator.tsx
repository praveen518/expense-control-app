import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardStack } from './DashboardStack';
import { PocketsStack } from './PocketsStack';
import { ProfileStack } from './ProfileStack';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
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
