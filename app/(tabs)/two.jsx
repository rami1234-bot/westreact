import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import Main from '../homepage/main'; 


import { useRouter } from 'expo-router';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false); // Track if user is signed in

  const navigation = useNavigation(); // Initialize navigation
  const router = useRouter();
  const handleSignin = async () => {
    Alert.alert('Signing In...', 'Please wait while we log you in.');

    if (!email || !password) {
      Alert.alert('Error', 'Both email and password are required.');
      return;
    }

    try {
      const response = await fetch('https://select-antelope-perfectly.ngrok-free.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.msg || 'Login successful!');

        const token = data.token;

        if (token) {
          await SecureStore.setItemAsync('userToken', token);
          console.log('Token saved successfully:', token);
        }

        setIsSignedIn(true); // Set signed-in state to true after successful login
      } else {
        Alert.alert('Error', data.msg || 'Login failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleGoToMain = () => {


    const startTime = performance.now(); // Start timing
     SecureStore.setItemAsync('userToken', "token");
    const endTime = performance.now(); // End timing

    const timeTaken = endTime - startTime; // Calculate the time taken

    console.log(`Time taken to set token: ${timeTaken.toFixed(2)} ms`); // Log the time taken
    //SecureStore.setItemAsync('userToken', "hello");
     router.navigate('homepage');
 //   navigation.navigate('/homepage');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

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

      <Button title="Sign In" onPress={handleSignin} />

      
        <Button title="Go to Main" onPress={handleGoToMain} />
      
    </View>
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
