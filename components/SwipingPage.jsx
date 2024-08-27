import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const SwipingPage = () => {
  const [cards, setCards] = useState([
    { id: 1, text: 'Card 1' },
    { id: 2, text: 'Card 2' },
    { id: 3, text: 'Card 3' },
  
  ]);

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
