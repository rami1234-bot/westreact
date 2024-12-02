import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, View } from '@/components/Themed'; // Adjust this import according to your project structure
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import * as SecureStore from 'expo-secure-store'; // Securely store user tokens
import { useRouter } from 'expo-router'; // Ensure you have this package installed

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    // Input validation
    if (!email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const auth = getAuth();

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's UID securely
      await SecureStore.setItemAsync('userToken', user.uid);
      console.log('User signed in successfully:', user.uid);

      router.navigate('homepage'); // Adjust the path to your home page
    } catch (error) {
      Alert.alert('Error', error.message || 'Sign-in failed. Please try again.');
      console.error('Sign-in Error:', error);
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
      
      {/* Add the Sign In text */}
      <Text style={styles.signInText}>Sign In</Text>

      <View style={styles.separator} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#FFFFFF" // White placeholder text
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#FFFFFF" // White placeholder text
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
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
  signInText: {
    fontSize: 24, // Font size for "Sign In"
    color: '#FEAD1C', // Gold text color
    marginBottom: 10, // Reduced space between "Sign In" and the separator
    fontWeight: 'bold', // Bold text
  },
  separator: {
    marginVertical: 20, // Reduced vertical space for the separator
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
    width: '80%',
    color: '#FFFFFF', // White text input
  },
  button: {
    backgroundColor: '#FEAD1C', // Gold button
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#0E415E', // Dark blue text
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
