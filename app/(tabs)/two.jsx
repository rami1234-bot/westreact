import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import MainScreen from '../homepage/main'; // Adjust the path to your MainScreen component
import { useRouter } from 'expo-router';

const Stack = createStackNavigator();

function TabTwoScreen() {
  const [identifier, setIdentifier] = useState(''); // Changed to identifier
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State for remember me
  const navigation = useNavigation();
  const router = useRouter();

  // Effect to load saved credentials
  useEffect(() => {
    const loadCredentials = async () => {
      const savedIdentifier = await AsyncStorage.getItem('userIdentifier'); // Changed to userIdentifier
      const savedPassword = await AsyncStorage.getItem('userPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');

      if (savedRememberMe === 'true') {
        setIdentifier(savedIdentifier || '');
        setPassword(savedPassword || '');
        setRememberMe(true);
      }
    };

    loadCredentials();
  }, []);

  const handleLogin = async () => {
    Alert.alert('Logging In...', 'Please wait while we log you in.');

    if (!identifier || !password) {
      Alert.alert('Error', 'Both fields are required.');
      return;
    }

    try {
      const response = await fetch('https://select-antelope-perfectly.ngrok-free.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }), // Use identifier instead of email
      });

      // Check if the response is OK
      if (!response.ok) {
        const text = await response.text(); // Get the response as text for debugging
        console.error('Error response:', text);
        Alert.alert('Error', 'Login failed. Please check your credentials or try again later.');
        return;
      }

      const data = await response.json(); // Now safely parse as JSON

      // Continue with success logic
      if (data.access_token) { // Check for access_token instead of data.success
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          await AsyncStorage.setItem('userIdentifier', identifier); // Save as userIdentifier
          await AsyncStorage.setItem('userPassword', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('userIdentifier'); // Remove if not remembering
          await AsyncStorage.removeItem('userPassword');
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        Alert.alert('Success', data.msg || 'Login successful!');
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', data.msg || 'Login failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Sign In</Text>
        <View style={styles.separator} />

        <TextInput
          style={styles.input}
          placeholder="Username or Email" // Updated placeholder
          value={identifier} // Use identifier state
          onChangeText={setIdentifier} // Set identifier on change
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Remember Me Checkbox */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={toggleRememberMe}>
          <View style={styles.checkbox}>
            {rememberMe && <View style={styles.checkboxTick} />}
          </View>
          <Text style={styles.label}>Remember Me</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
          <Text style={styles.submitButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* MainButton that navigates to MainScreen */}
        <Button title="Go to Main" onPress={() => router.push('/homepage')} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="TabTwo">
      <Stack.Screen
        name="TabTwo"
        component={TabTwoScreen}
        options={{ headerShown: false }} // Hide the header
      />
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerTitle: '' }} // Hide the header title
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
  },
  label: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
