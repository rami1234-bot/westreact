import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import * as SecureStore from 'expo-secure-store';

const SwipingPage = () => {
  const [cards, setCards] = useState([
    { id: 1, text: 'Card 1' },
    { id: 2, text: 'Card 2' },
    { id: 3, text: 'Card 3' },
  ]);

  // Function to retrieve the token from secure storage
  const retrieveToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Display the token in an alert
        Alert.alert('Token Retrieved', `Your token is: ${token}`);
      } else {
        Alert.alert('No Token Found', 'Token not found in secure storage.');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  // Fetch the token when the component is loaded
  useEffect(() => {
    retrieveToken();
  }, []);

  const onSwipedLeft = (cardIndex) => {
    console.log(`Swiped left on card ${cardIndex}`);
  };

  const onSwipedRight = (cardIndex) => {
    console.log(`Swiped right on card ${cardIndex}`);
  };

  return (
    <View style={styles.container}>
      <Swiper
        cards={cards}
        renderCard={(card) => (
          <View style={styles.card}>
            <Text style={styles.text}>{card.text}</Text>
          </View>
        )}
        onSwipedLeft={onSwipedLeft}
        onSwipedRight={onSwipedRight}
        cardIndex={0}
        backgroundColor={'#4FD0E9'}
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 22,
    color: '#333',
  },
});

export default SwipingPage;
