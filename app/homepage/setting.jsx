import React, { useState } from 'react';
import { StyleSheet, Button, Alert, Switch, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(true);
  const [isReadReceiptsEnabled, setIsReadReceiptsEnabled] = useState(true);

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'This is where you can change your privacy settings.');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This is where you can change your password.');
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
              const response = await fetch('https://select-antelope-perfectly.ngrok-free.app/delete-account', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'user@example.com' }),
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Account Deleted', data.msg || 'Your account has been deleted.');
              } else {
                Alert.alert('Error', data.msg || 'Failed to delete account. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred. Please try again later.');
              console.error('Error:', error);
            }
          },
        },
      ]
    );
  };

  const handleOtherSettings = () => {
    Alert.alert('Other Settings', 'This is where other settings options will be.');
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsEnabled(previousState => !previousState);
    Alert.alert('Notifications', isNotificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
  };

  const handleProfileVisibilityToggle = () => {
    setIsProfileVisible(previousState => !previousState);
    Alert.alert('Profile Visibility', isProfileVisible ? 'Profile hidden' : 'Profile visible');
  };

  const handleDarkModeToggle = () => {
    setIsDarkModeEnabled(previousState => !previousState);
    Alert.alert('Dark Mode', isDarkModeEnabled ? 'Dark mode disabled' : 'Dark mode enabled');
  };

  const handleLocationSharingToggle = () => {
    setIsLocationSharingEnabled(previousState => !previousState);
    Alert.alert('Location Sharing', isLocationSharingEnabled ? 'Location sharing disabled' : 'Location sharing enabled');
  };

  const handleReadReceiptsToggle = () => {
    setIsReadReceiptsEnabled(previousState => !previousState);
    Alert.alert('Read Receipts', isReadReceiptsEnabled ? 'Read receipts disabled' : 'Read receipts enabled');
  };

  const handleManageAccount = () => {
    Alert.alert('Manage Account', 'This is where you can update your account information.');
  };

  const handleBlockedUsers = () => {
    Alert.alert('Blocked Users', 'This is where you can manage blocked users.');
  };

  const handleLanguageSettings = () => {
    Alert.alert('Language Settings', 'This is where you can change the app language.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This is where you can view the privacy policy.');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'This is where you can view the terms of service.');
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
              // Clear user session (e.g., remove token from AsyncStorage)
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.clear();

              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
              console.error('Logout Error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Button title="Privacy Settings" onPress={handlePrivacySettings} />
      <Button title="Change Password" onPress={handleChangePassword} />
      <Button title="Manage Account" onPress={handleManageAccount} />
      <Button title="Blocked Users" onPress={handleBlockedUsers} />
      <Button title="Language Settings" onPress={handleLanguageSettings} />
      <Button title="Privacy Policy" onPress={handlePrivacyPolicy} />
      <Button title="Terms of Service" onPress={handleTermsOfService} />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={handleNotificationsToggle}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Profile Visibility</Text>
        <Switch
          value={isProfileVisible}
          onValueChange={handleProfileVisibilityToggle}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Dark Mode</Text>
        <Switch
          value={isDarkModeEnabled}
          onValueChange={handleDarkModeToggle}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Location Sharing</Text>
        <Switch
          value={isLocationSharingEnabled}
          onValueChange={handleLocationSharingToggle}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Read Receipts</Text>
        <Switch
          value={isReadReceiptsEnabled}
          onValueChange={handleReadReceiptsToggle}
        />
      </View>

      <Button title="Delete Account" onPress={handleDeleteAccount} color="red" />
      <Button title="Logout" onPress={handleLogout} color="red" />
      <Button title="Other Settings" onPress={handleOtherSettings} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
});
