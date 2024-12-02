import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Switch } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getDatabase, ref, onValue } from 'firebase/database';
import { firebaseApp } from '../../firebase';

export default function MapScreen() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [filteredCheckpoints, setFilteredCheckpoints] = useState([]);
  const [isOpenChecked, setIsOpenChecked] = useState(true);
  const [isClosedChecked, setIsClosedChecked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data from Realtime Database
  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const checkpointsRef = ref(db, 'checkpoints');

    onValue(checkpointsRef, (snapshot) => {
      const data = snapshot.val();
      const checkpointList = [];

      for (let id in data) {
        checkpointList.push({
          id,
          ...data[id],
        });
      }

      setCheckpoints(checkpointList);
      setFilteredCheckpoints(checkpointList);
    });
  }, []);

  // Filter checkpoints based on toggles and search query
  useEffect(() => {
    const filtered = checkpoints.filter((checkpoint) => {
      const matchesAvailability =
        (isOpenChecked && checkpoint.availability === 'open') ||
        (isClosedChecked && checkpoint.availability === 'closed');
      const matchesSearchQuery = checkpoint.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesAvailability && matchesSearchQuery;
    });

    setFilteredCheckpoints(filtered);
  }, [isOpenChecked, isClosedChecked, searchQuery, checkpoints]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter toggles */}
      <ScrollView horizontal style={styles.filterContainer}>
        <View style={styles.switchContainer}>
          <Text>Open</Text>
          <Switch value={isOpenChecked} onValueChange={setIsOpenChecked} />
        </View>

        <View style={styles.switchContainer}>
          <Text>Closed</Text>
          <Switch value={isClosedChecked} onValueChange={setIsClosedChecked} />
        </View>
      </ScrollView>

      {/* Map */}
      <MapView style={styles.map}>
        {filteredCheckpoints.map((checkpoint) => (
          <Marker
            key={checkpoint.id}
            coordinate={{
              latitude: checkpoint.latitude,
              longitude: checkpoint.longitude,
            }}
            pinColor={checkpoint.availability === 'open' ? '#FFD700' : 'red'}
          >
            <Callout>
              <View>
                <Text style={styles.title}>{checkpoint.name}</Text>
                <Text>Availability: {checkpoint.availability}</Text>
                <Text>Last Updated: {new Date(checkpoint.lastUpdated).toLocaleString()}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterContainer: {

    position: 'absolute',
    top: 100, // Lower the filters from 100 to 150
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  searchBar: {
    position: 'absolute',
    top: 50, // Also lower the search bar accordingly
    left: 10,
    right: 10,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: 'white',
    zIndex: 10,
  },
});

