import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Text, View } from '@/components/Themed'; // Adjust this import according to your project structure
import { auth } from '../../firebase'; // Import the Firebase authentication instance
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
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
      // Create user with email and password using Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // If successful, store the user token and refresh token securely
      const token = await user.getIdToken();
      const refreshToken = user.refreshToken;
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      Alert.alert('Success', 'Registration successful!');
      console.log('User created:', user);

      // Navigate to the home page or another screen
      router.replace('homepage'); // Adjust the path to your home page
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false); // Set loading to false after the attempt
    }
  };

  return (
    <View style={styles.container}>
      {/* Add your logo image here */}
      <Image
        source={require('../../images/westimg.jpg')} // Adjust the path to your logo image
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.separator} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#FFFFFF" // White placeholder text
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
        placeholderTextColor="#FFFFFF" // White placeholder text
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password Input"
        accessibilityHint="Enter your password (minimum 6 characters)"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#FFFFFF" // White placeholder text
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
    justifyContent: 'flex-start', // Changed to flex-start to move everything to the top
    backgroundColor: '#0E415E', // Dark blue background
    padding: 16,
  },
  logo: {
    width: 250, // Set width for the logo
    height: 250, // Set height for the logo
    marginBottom: -50, // Space between logo and title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FEAD1C', // Gold title
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#FFFFFF', // White separator line
  },
  input: {
    height: 50,
    borderColor: '#FEAD1C', // Gold border
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%', // Adjusted input width
    backgroundColor: '#0E415E', // Set background color to match the main container
    color: '#FFFFFF', // White text color for input
  },
  button: {
    backgroundColor: '#FEAD1C', // Gold button
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0E415E', // Dark blue text
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
