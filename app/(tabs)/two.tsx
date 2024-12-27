import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Text, View } from '@/components/Themed'; // Adjust this import according to your project structure
import { Client, Account, ID } from 'react-native-appwrite'; // Import Appwrite SDK
import { router, Router } from 'expo-router';
// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('676b38af0002477f6ae9'); // Your Project ID

const account = new Account(client);

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // Add name field for registration
  const [loading, setLoading] = useState(false); // Loading state

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true); // Set loading to true

    try {
      // Create a new Appwrite user
      const user = await account.create(ID.unique(), email, password, name);
      Alert.alert('Success', `Welcome, ${user.name}! Your account has been created.`);
      router.replace('/homepage/main');
    } catch (error) {
      Alert.alert( 'Registration failed. Please try again.');
      console.error('Sign-Up Error:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <View style={styles.container}>
      {/* Add your logo image here */}
      <Image
        source={require('../../images/lolo.png')} // Adjust the path to your logo image
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.separator} />

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#A0A0A0" // Teal placeholder text
        value={name}
        onChangeText={setName}
        accessibilityLabel="Name Input"
        accessibilityHint="Enter your full name"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A0A0A0" // Teal placeholder text
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email Input"
        accessibilityHint="Enter your email address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A0A0A0" // Teal placeholder text
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password Input"
        accessibilityHint="Enter your password (minimum 6 characters)"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#A0A0A0" // Teal placeholder text
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        accessibilityLabel="Confirm Password Input"
        accessibilityHint="Re-enter your password to confirm"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" /> // Loading indicator consistent with the button
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#F0F8FF', // Light blue background
    padding: 16,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: -50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#008080', // Teal title
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#D3D3D3', // Light gray separator
  },
  input: {
    height: 50,
    borderColor: '#008080', // Teal border
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%',
    backgroundColor: '#FFFFFF', // White background
    color: '#000000', // Black text
  },
  button: {
    backgroundColor: '#008080', // Teal button
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text on button
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
