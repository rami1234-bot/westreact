import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const interests = [
  'Reading', 'Traveling', 'Cooking', 'Photography', 'Writing', 
  'Drawing', 'Painting', 'Hiking', 'Cycling', 'Gaming', 
  'Music', 'Dancing', 'Fitness', 'Yoga', 'Meditation',
  'Running', 'Swimming', 'Fishing', 'Gardening', 'Shopping',
  'Fashion', 'Technology', 'Movies', 'Theater', 'Volunteering',
  'Animals', 'Environment', 'Astronomy', 'History', 'Science',
  'Art', 'Crafts', 'DIY', 'Woodworking', 'Cars',
  'Motorcycles', 'Sports', 'Football', 'Basketball', 'Baseball',
  'Tennis', 'Golf', 'Camping', 'Socializing', 'Board Games',
  'Puzzles', 'Knitting', 'Sewing', 'Coding', 'Blogging'
];

const InterestsScreen = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = () => {

    
    console.log('Selected Interests:', selectedInterests);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {interests.map((interest, index) => (
          <TouchableOpacity key={index} style={styles.checkboxContainer} onPress={() => toggleInterest(interest)}>
            <View style={styles.checkbox}>
              {selectedInterests.includes(interest) && <View style={styles.checkboxTick} />}
            </View>
            <Text style={styles.label}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
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

export default InterestsScreen;
