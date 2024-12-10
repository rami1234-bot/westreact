import React, { useState } from 'react';
import { StyleSheet, Button, Alert, Switch, ScrollView, Modal, TextInput, View as RNView } from 'react-native';
import { Text } from '@/components/Themed';

import { db } from '../../firebase'; // Adjust this import based on your Firebase configuration
import { ref, set, remove } from 'firebase/database'; // Import necessary Firebase functions
import { getAuth, deleteUser } from 'firebase/auth'; // Import necessary Firebase Authentication functions

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function SettingsScreen() {
  
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isCheckpointsAlertsEnabled, setIsCheckpointsAlertsEnabled] = useState(true);
  const [isCarNavigationEnabled, setIsCarNavigationEnabled] = useState(true);
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'Manage who can see your navigation activity.');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Change your account password here.');
  };

const handleDeleteAccount = async () => {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const auth = getAuth(); // Get the Firebase authentication instance
            const user = auth.currentUser;

            if (user) {
              const userId = user.uid; // Get the user's unique ID

              // Step 1: Delete user data from Firebase Realtime Database
              await remove(ref(db, `users/${userId}`)); // Adjust the path as per your database schema

              // Step 2: Delete the user from Firebase Authentication
              await deleteUser(user);

              // Step 3: Clear user session data
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.setItemAsync('isLoggedIn', 'false');

              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');

              // Navigate to the login screen or a landing page
              router.replace('(tabs)');

              console.log('Account deleted successfully.');
            } else {
              Alert.alert('Error', 'No user is currently logged in.');
            }
          } catch (error) {
            Alert.alert('Error', 'An error occurred while deleting your account.');
            console.error('Error:', error);
          }
        },
      },
    ]
  );
};


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Remove the user token and update the logged-in status
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.setItemAsync('isLoggedIn', 'false');
  
              // Reset navigation to go back to the login screen
              router.replace('(tabs)');
  
              console.log('User logged out successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout.');
              console.error('Logout Error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };



  const handleContactUs = async () => {
    if (!username || !message) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    try {
      // Save message to Firebase Realtime Database
      const messageRef = ref(db, 'messages/' + Date.now()); // Using current timestamp as ID
      await set(messageRef, {
        username: username,
        message: message,
      });

      // Show success alert
      Alert.alert('Success', 'Your message has been sent successfully!');

      // Clear the fields
      setUsername('');
      setMessage('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message.');
      console.error('Firebase Error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <RNView style={styles.separator} />

      {/* Notifications Switch */}
      <RNView style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={() => setIsNotificationsEnabled(prev => !prev)}
          trackColor={{ false: "#767577", true: "#FEAD1C" }} // Custom track color
          thumbColor={isNotificationsEnabled ? "#0E415E" : "#f4f3f4"} // Custom thumb color
        />
      </RNView>

      {/* Location Sharing Switch */}
      <RNView style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Location Sharing</Text>
        <Switch
          value={isLocationSharingEnabled}
          onValueChange={() => setIsLocationSharingEnabled(prev => !prev)}
          trackColor={{ false: "#767577", true: "#FEAD1C" }} // Custom track color
          thumbColor={isLocationSharingEnabled ? "#0E415E" : "#f4f3f4"} // Custom thumb color
        />
      </RNView>

      {/* Checkpoints Alerts Switch */}
      <RNView style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Checkpoints Alerts</Text>
        <Switch
          value={isCheckpointsAlertsEnabled}
          onValueChange={() => setIsCheckpointsAlertsEnabled(prev => !prev)}
          trackColor={{ false: "#767577", true: "#FEAD1C" }} // Custom track color
          thumbColor={isCheckpointsAlertsEnabled ? "#0E415E" : "#f4f3f4"} // Custom thumb color
        />
      </RNView>

      {/* Car Navigation Switch */}
      <RNView style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Car Navigation Mode</Text>
        <Switch
          value={isCarNavigationEnabled}
          onValueChange={() => setIsCarNavigationEnabled(prev => !prev)}
          trackColor={{ false: "#767577", true: "#FEAD1C" }} // Custom track color
          thumbColor={isCarNavigationEnabled ? "#0E415E" : "#f4f3f4"} // Custom thumb color
        />
      </RNView>

      {/* Dark Mode Switch */}
      <RNView style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Dark Mode</Text>
        <Switch
          value={isDarkModeEnabled}
          onValueChange={() => setIsDarkModeEnabled(prev => !prev)}
          trackColor={{ false: "#767577", true: "#FEAD1C" }} // Custom track color
          thumbColor={isDarkModeEnabled ? "#0E415E" : "#f4f3f4"} // Custom thumb color
        />
      </RNView>

      <RNView style={styles.buttonContainer}>
        {/* Buttons for account and other settings */}
        <Button title="Privacy Settings" onPress={handlePrivacySettings} color="#FEAD1C" />
        <Button title="Change Password" onPress={handleChangePassword} color="#FEAD1C" />
        <Button title="Delete Account" onPress={handleDeleteAccount} color="red" />
        <Button title="Logout" onPress={handleLogout} color="red" />
      </RNView>

      {/* Contact Us Button */}
      <Button title="Contact Us" onPress={() => setIsModalVisible(true)} color="#FEAD1C" />

      {/* Additional Settings */}
      <RNView style={styles.separator} />
      <Button title="Other Settings" onPress={() => Alert.alert('Other Settings', 'Additional settings.')} color="#FEAD1C" />

      {/* Contact Us Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <RNView style={styles.modalContainer}>
          <RNView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contact Us</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
            <Button title="Send" onPress={handleContactUs} color="#FEAD1C" />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
          </RNView>
        </RNView>
      </Modal>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0E415E', // Set a background color for the container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', // Center the title
  },
  separator: {
    marginVertical: 10,
    height: 1,
    backgroundColor: '#CED0CE', // Separator color
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#0E415E', // Background color for button container
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#CED0CE',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
