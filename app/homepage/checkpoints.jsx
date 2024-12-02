import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Alert, FlatList, TouchableOpacity } from 'react-native';
import { View } from '@/components/Themed';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { firebaseApp } from '../../firebase';
import * as Notifications from 'expo-notifications';

export default function TabTwoScreen() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false); // Manage dark mode state
  const [expoPushToken, setExpoPushToken] = useState(''); // User's push notification token


  const sendPushNotification = async (token, title, body) => {
    console.log(expoPushToken);
    const message = {
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: { someData: 'goes here' },
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };
  

  // Fetch the push notification token
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });
  }, []);

  // Fetch data from Realtime Database
  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const checkpointsRef = ref(db, 'checkpoints');

    // Listen for data changes
    onValue(checkpointsRef, (snapshot) => {
      const data = snapshot.val();
      const checkpointList = [];

      for (let id in data) {
        checkpointList.push({
          id,
          ...data[id],
        });
      }

      const sortedCheckpoints = checkpointList.sort((a, b) => {
        return b.isFavorite - a.isFavorite; // Sort by isFavorite
      });

      setCheckpoints(sortedCheckpoints);
    });
  }, []);

  const sendPushNotificationsToTokens = async (tokens, checkpointName, newStatus) => {
    if (!tokens || tokens.length === 0) return;
  
    const title = `Checkpoint Status Update`;
    const body = `${checkpointName} is now ${newStatus}`;
  
    await Promise.all(tokens.map(async (token) => {
      try {
        console.log(tokens);
        await sendPushNotification(token, title, body);
      } catch (error) {
        console.error(`Error sending push notification to token ${token}:`, error);
      }
    }));
  };
  
  



  const handleStatusChange = (checkpoint) => {
    Alert.alert(
      'Change Status',
      `Change the status of ${checkpoint.name} to:`,
      [
        {
          text: 'Open',
          onPress: () => updateCheckpointStatus(checkpoint.id, 'open'),
        },
        {
          text: 'Closed',
          onPress: () => updateCheckpointStatus(checkpoint.id, 'closed'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const updateCheckpointStatus = async (id, newStatus) => {
    const db = getDatabase(firebaseApp);
    const checkpointRef = ref(db, `checkpoints/${id}`);
    const currentTime = new Date().toISOString(); // Get current timestamp
  
    // Find the checkpoint
    const checkpoint = checkpoints.find(cp => cp.id === id);
  
    if (!checkpoint) {
      Alert.alert('Error', 'Checkpoint not found.');
      return;
    }
  
    // Update checkpoint status in the database
    await set(checkpointRef, {
      ...checkpoint, // Keep existing data
      availability: newStatus, // Update status
      lastUpdated: currentTime, // Set last updated time
    })
    .then(() => {
      sendPushNotificationsToTokens(checkpoint.tokens, checkpoint.name, newStatus);
    })
    .catch((error) => {
      Alert.alert('Error', 'Failed to update status. Please try again later.');
      console.error('Error updating status:', error);
    });
  };
  

  const toggleFavorite = async (checkpoint) => {
    const newFavoriteStatus = !checkpoint.isFavorite; // Toggle the favorite status
    const db = getDatabase(firebaseApp);
    const checkpointRef = ref(db, `checkpoints/${checkpoint.id}`);
   

    // Fetch the checkpoint's current list of tokens
    let tokens = checkpoint.tokens || [];

    // Add or remove the user's token
    if (newFavoriteStatus) {
      // Add token if it's marked as a favorite
      if (!tokens.includes(expoPushToken)) {
        tokens.push(expoPushToken);
      }
    } else {
      // Remove token if it's unmarked as a favorite
      tokens = tokens.filter(token => token !== expoPushToken);
    }

    // Update the checkpoint in the database with the new favorite status and token list
    set(checkpointRef, {
      ...checkpoints.find(cp => cp.id === checkpoint.id), // Keep existing data
      isFavorite: newFavoriteStatus, // Update favorite status
     
      tokens, // Save the updated token list
    })
      .then(() => {
        setCheckpoints(prevCheckpoints => 
          [...prevCheckpoints].sort((a, b) => b.isFavorite - a.isFavorite)
        );
      })
      .catch((error) => {
        console.error('Error updating favorite status:', error);
      });
  };

  const renderCheckpoint = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.checkpoint, 
        { backgroundColor: isDarkModeEnabled ? '#333' : '#f9f9f9' } // Dynamic background color
      ]}
      onPress={() => handleStatusChange(item)}
    >
      <View>
        <Text style={[styles.checkpointText, { color: isDarkModeEnabled ? '#fff' : '#000' }]}>
          {item.name}
        </Text>
        {/* Display last updated timestamp */}
        <Text style={styles.lastUpdatedText}>
          Last updated: {new Date(item.lastUpdated).toLocaleString()}
        </Text>
      </View>
      <View style={styles.favoriteContainer}>
        <View style={styles.statusContainer}>
          <Text style={[styles.checkpointStatus, { color: item.availability === 'open' ? '#FEAD1C' : '#000' }]}>
            {item.availability === 'open' ? 'Open' : 'Closed'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item)}>
          <View style={styles.favoriteBackground}>
            <Text style={[styles.favoriteText, { color: item.isFavorite ? '#FFD700' : 'grey' }]}>
              {item.isFavorite ? '⭐️' : '☆'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDarkModeEnabled ? '#fff' : '#000' }]}>Checkpoints</Text>
      <FlatList
        data={checkpoints}
        renderItem={renderCheckpoint}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

// Helper function to register for push notifications
async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0E415E',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0E415E',
  },
  list: {
    marginBottom: 20,
    color: '#0E415E',
  },
  checkpoint: {
    backgroundColor: 'white',
    padding: 15,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: 'white', // Background behind the status
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  favoriteBackground: {
    backgroundColor: 'white', // Background behind the star
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  checkpointText: {
    fontSize: 18,
    backgroundColor: 'white',
  },
  checkpointStatus: {
    fontSize: 16,
    backgroundColor: 'white',
    fontWeight: 'bold',
    color: 'black',
  },
  favoriteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdatedText: {
    backgroundColor: 'white',
    fontSize: 12,
    color: 'grey',
    marginTop: 5,
  },
});

