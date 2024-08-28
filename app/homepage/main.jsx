import React from 'react';
import { SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SwipingPage from '../../components/SwipingPage';  

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SwipingPage"
        component={SwipingPage}
        options={{ headerShown: false }} // Hide the header
      />
    </Stack.Navigator>
  );
};

export default App;
