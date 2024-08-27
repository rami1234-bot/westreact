import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../homepage/main'; // adjust the path to your Main.jsx

import { useRouter } from 'expo-router';
const Stack = createStackNavigator();

function TabTwoScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // Access the navigation object
  const router = useRouter();
  const handleLogin = async () => {
    Alert.alert('Logging In...', 'Please wait while we log you in.');

    if (!email || !password) {
      Alert.alert('Error', 'Both fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.msg || 'Login successful!');
        // Navigate to MainScreen after successful login
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', data.msg || 'Login failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <View style={styles.separator} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign In" onPress={handleLogin} />

      {/* MainButton that navigates to MainScreen */}
      <Button title="Go to Main" onPress={() => router.push('/homepage')} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="TabTwo">
      <Stack.Screen name="TabTwo" component={TabTwoScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%',
  },
});
