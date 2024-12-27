import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Client, Account, ID, Models } from 'react-native-appwrite';

let client = new Client();
let account = new Account(client);

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('66e943139f030e2feaf8'); // Your Project ID

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Toggle between Login and Register

  async function login(email: string, password: string) {
    try {
      await account.createSession(email, password);
      const user = await account.get();
      setLoggedInUser(user);
      Alert.alert('Success', `Welcome back, ${user.name}!`);
    } catch (error ) {
      }
  }

  async function register(email: string, password: string, name: string) {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error) {
      Alert.alert('Error',  'Registration failed. Please try again.');
      console.error('Registration Error:', error);
    }
  }

  const handleSubmit = () => {
    if (isRegister) {
      if (!email || !password || !name) {
        Alert.alert('Error', 'All fields are required for registration.');
        return;
      }
      register(email, password, name);
    } else {
      if (!email || !password) {
        Alert.alert('Error', 'Email and Password are required for login.');
        return;
      }
      login(email, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? 'Register' : 'Login'}</Text>
      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A0A0A0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? 'Register' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.toggleText}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#008080',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#008080',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  button: {
    backgroundColor: '#008080',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggleText: {
    marginTop: 20,
    color: '#008080',
    textDecorationLine: 'underline',
  },
});
