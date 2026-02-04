import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PocketsScreen } from '../screens/PocketsScreen';
import { CreatePocketScreen } from '../screens/CreatePocketScreen';
import { PocketDetailScreen } from '../screens/PocketDetailsScreen';

const Stack = createNativeStackNavigator();

export const PocketsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Pockets"
        component={PocketsScreen}
        options={{ title: 'Pockets' }}
      />
      <Stack.Screen
        name="CreatePocket"
        component={CreatePocketScreen}
        options={{ title: 'Create Pocket' }}
      />
      <Stack.Screen
        name="PocketDetail"
        component={PocketDetailScreen}
        options={{ title: 'Pocket' }}
      />
    </Stack.Navigator>
  );
};
