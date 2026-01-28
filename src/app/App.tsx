import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { AppNavigator } from '../navigation/AppNavigator';

const App = () => {
  return (
    <AppLayout>
      <AppNavigator />
    </AppLayout>
  );
};

export default App;
