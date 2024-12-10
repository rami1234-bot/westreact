import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, View } from '@/components/Themed'; // Adjust this import according to your project structure
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import * as SecureStore from 'expo-secure-store'; // Securely store user tokens
import { useRouter } from 'expo-router'; // Ensure you have this package installed

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check if the userToken exists in SecureStore
        const userToken = await SecureStore.getItemAsync('userToken');
        if (userToken) {
          console.log('User is already logged in:', userToken);
          router.replace('homepage'); // Adjust the path to your home page
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedIn();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's UID securely
      await SecureStore.setItemAsync('userToken', user.uid);
      console.log('User signed in successfully:', user.uid);

      router.replace('homepage'); // Navigate to the home page
    } catch (error) {
      Alert.alert('Error', error.message || 'Sign-in failed. Please try again.');
      console.error('Sign-in Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../images/westimg.jpg')} // Adjust the path to your logo image
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.signInText}>Sign In</Text>
      <View style={styles.separator} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#FFFFFF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#FFFFFF"
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
    justifyContent: 'flex-start',
    backgroundColor: '#0E415E',
    padding: 16,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: -50,
  },
  signInText: {
    fontSize: 24,
    color: '#FEAD1C',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 50,
    borderColor: '#FEAD1C',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#FEAD1C',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#0E415E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
