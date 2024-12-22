import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Switch,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref,onValue, set, get, query, orderByChild, limitToLast } from 'firebase/database';
import { firebaseApp } from '../../firebase';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router'; // Ensure you have this package installed
export default function SettingsScreen() {
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLeaderboardModalVisible, setIsLeaderboardModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
const router = useRouter();

  // Translations for English and Arabic
  const translations = {
    English: {
      title: 'Settings',
      darkMode: 'Dark Mode',
      notifications: 'Enable Notifications',
      language: 'Language',
      account: 'Account Settings',
      manageAccount: 'Manage Account',
      feedback: 'Feedback',
      sendFeedback: 'Send Feedback',
      enterMessage: 'Enter your feedback...',
      leaderboard: 'Leaderboard',
      topScorers: 'Top Scorers',
      logout: 'Logout',
      deleteAccount: 'Delete Account',
    },
    Arabic: {
      title: 'الإعدادات',
      darkMode: 'الوضع الداكن',
      notifications: 'تفعيل الإشعارات',
      language: 'اللغة',
      account: 'إعدادات الحساب',
      manageAccount: 'إدارة الحساب',
      feedback: 'التعليقات',
      sendFeedback: 'إرسال التعليق',
      enterMessage: 'أدخل تعليقك...',
      leaderboard: 'لائحة المتصدرين',
      topScorers: 'أفضل اللاعبين',
      logout: 'تسجيل الخروج',
      deleteAccount: 'حذف الحساب',
    },
  };

  const currentTranslation = translations[selectedLanguage] || translations['English'];

  useEffect(() => {
    loadSettings();
  }, []);

  const handleDeleteAccount = async () => {
    setLoading(true);
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const userId = user.uid;
  
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(user.email, password); // Replace `password` with a secure prompt for the user
        await reauthenticateWithCredential(user, credential);
  
        // Delete user data
        await remove(ref(db, `users/${userId}`));
  
        // Delete the user from Firebase
        await deleteUser(user);
  
        // Clear session data
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.setItemAsync('isLoggedIn', 'false');
  
        console.log('Account deleted successfully.');
  
        // Navigate to sign-in screen
        router.replace('(tabs)');
      } else {
        Alert.alert('Error', 'No user is currently logged in.');
      }
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Re-Authentication Required', 'Please re-login to delete your account.');
      } else {
        Alert.alert('Error', 'An error occurred while deleting your account.');
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setIsDeleteAccountModalVisible(false);
    }
  };
  





  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
  
      // Clear user session
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.setItemAsync('isLoggedIn', 'false');
  
      console.log('User logged out successfwdawdully.');
      // Navigate to sign-in screen
      router.push('');
  
     
    } catch (error) {
      Alert.alert('Error', 'Failed to logout.');
      console.error('Logout Error:', error);
    }
    setIsLogoutModalVisible(false);
  };
  

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('isDarkModeEnabled');
      const notifications = await AsyncStorage.getItem('isNotificationsEnabled');
      const language = await AsyncStorage.getItem('selectedLanguage');

      if (darkMode !== null) setIsDarkModeEnabled(JSON.parse(darkMode));
      if (notifications !== null) setIsNotificationsEnabled(JSON.parse(notifications));
      if (language !== null) setSelectedLanguage(language);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  const toggleNotifications = () => {
    setIsNotificationsEnabled((prev) => {
      const newValue = !prev;
      saveSetting('isNotificationsEnabled', newValue);
      return newValue;
    });
  };

    // Change Language Setting
    const changeLanguage = (language) => {
      setSelectedLanguage(language);
      saveSetting('selectedLanguage', language);
    };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkModeEnabled((prev) => {
      const newValue = !prev;
      saveSetting('isDarkModeEnabled', newValue);
      return newValue;
    });
  };

  // Save settings to AsyncStorage
  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  function fetchLeaderboard() {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
  
    // Query to fetch users ordered by their points
    const topScorersQuery = query(usersRef, orderByChild('points'));
  
    onValue(
      topScorersQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
  
          // Convert data to an array of users
          const users = Object.entries(data).map(([userId, userData]) => ({
            id: userId,
            name: userData.name || 'Anonymous',
            score: userData.points || 0, // Use `points` field here
          }));
  
          // Sort users in descending order of points
          users.sort((a, b) => b.score - a.score);
  
          console.log('Top Scorers:', users);
          setLeaderboard(users); // Update leaderboard state
          setIsLeaderboardModalVisible(true);
        } else {
          console.log('No users found.');
        }
      },
      (error) => {
        console.error('Error fetching leaderboard:', error);
      }
    );
  }
  

  return (
    <View style={[styles.container, isDarkModeEnabled && styles.darkContainer]}>
      <Text style={[styles.title, isDarkModeEnabled && styles.darkTitle]}>
        {currentTranslation.title}
      </Text>

      {/* Dark Mode Setting */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>
          {currentTranslation.darkMode}
        </Text>
        <Switch
          value={isDarkModeEnabled}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkModeEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      

      {/* Notifications Setting */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>{currentTranslation.notifications}</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isNotificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Language Setting */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>{currentTranslation.language}</Text>
        <TouchableOpacity onPress={() => changeLanguage('English')} style={styles.languageButton}>
          <Text style={[styles.languageButtonText, selectedLanguage === 'English' && styles.selectedLanguage]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeLanguage('Arabic')} style={styles.languageButton}>
          <Text style={[styles.languageButtonText, selectedLanguage === 'Arabic' && styles.selectedLanguage]}>
          عربي
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>{currentTranslation.account}</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={[styles.settingsButtonText, isDarkModeEnabled && styles.darkSettingText]}>
            {currentTranslation.manageAccount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Button */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>
          {currentTranslation.leaderboard}
        </Text>
        <TouchableOpacity onPress={fetchLeaderboard} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>{currentTranslation.topScorers}</Text>
        </TouchableOpacity>
      </View>




      <View style={styles.settingRow}>
  <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>
    {currentTranslation.logout}
  </Text>
  <TouchableOpacity onPress={() => setIsLogoutModalVisible(true)} style={styles.settingsButton}>
    <Text style={styles.settingsButtonText}>{currentTranslation.logout}</Text>
  </TouchableOpacity>
</View>


      {/* Delete Account Button */}
  {/* Delete Account Button */}
{/* Delete Account Button */}
<View style={styles.settingRow}>
  <Text style={[styles.settingText, isDarkModeEnabled && styles.darkSettingText]}>
    {currentTranslation.deleteAccount}
  </Text>
  <TouchableOpacity onPress={() => setIsDeleteAccountModalVisible(true)} style={styles.settingsButton}>
    <Text style={styles.settingsButtonText}>{currentTranslation.deleteAccount}</Text>
  </TouchableOpacity>
</View>



      {/* Leaderboard Modal */}
      <Modal
        visible={isLeaderboardModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLeaderboardModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, isDarkModeEnabled && styles.darkModal]}>
            <Text style={[styles.modalTitle, isDarkModeEnabled && styles.darkModalTitle]}>
              {currentTranslation.topScorers}
            </Text>
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <Text
                  style={[styles.leaderboardItem, isDarkModeEnabled && styles.darkLeaderboardItem]}
                >
                  {`${index + 1}. ${item.name || 'Anonymous'} - ${item.score || 0}`}
                </Text>
              )}
            />
            <Button title="Close" onPress={() => setIsLeaderboardModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
<Modal
  visible={isLogoutModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setIsLogoutModalVisible(false)}
>
  <View style={styles.modalBackground}>
    <View style={[styles.modalContainer, isDarkModeEnabled && styles.darkModal]}>
      <Text style={[styles.modalTitle, isDarkModeEnabled && styles.darkModalTitle]}>
        {currentTranslation.logout}
      </Text>
      <Text style={[styles.modalMessage, isDarkModeEnabled && styles.darkModalMessage]}>
        {currentTranslation.logoutMessage}
      </Text>
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Cancel" onPress={() => setIsLogoutModalVisible(false)} />
    </View>
  </View>
</Modal>


{/* Delete Account Modal */}
<Modal
  visible={isDeleteAccountModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setIsDeleteAccountModalVisible(false)}
>
  <View style={styles.modalBackground}>
    <View style={[styles.modalContainer, isDarkModeEnabled && styles.darkModal]}>
      <Text style={[styles.modalTitle, isDarkModeEnabled && styles.darkModalTitle]}>
        {currentTranslation.deleteAccount}
      </Text>
      <Text style={[styles.modalMessage, isDarkModeEnabled && styles.darkModalMessage]}>
        {currentTranslation.deleteAccountMessage}
      </Text>
      <Button title="Delete" onPress={handleDeleteAccount} />
      <Button title="Cancel" onPress={() => setIsDeleteAccountModalVisible(false)} />
    </View>
  </View>
</Modal>




    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  darkTitle: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  settingText: {
    fontSize: 18,
    color: '#333',
  },
  darkSettingText: {
    color: '#fff',
  },
  settingsButton: {
    backgroundColor: '#81b0ff',
    padding: 10,
    borderRadius: 5,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  darkModal: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  darkModalTitle: {
    color: '#fff',
  },
  leaderboardItem: {
    fontSize: 16,
    padding: 5,
  },
  darkLeaderboardItem: {
    color: '#fff',
  },


  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  darkModal: {
    backgroundColor: '#333',
  },
  darkModalTitle: {
    color: '#fff',
  },
  darkModalMessage: {
    color: '#fff',
  },
});
