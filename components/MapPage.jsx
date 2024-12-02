// MapPage.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const MapPage = ({ route, currentLocation, destination }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker
          coordinate={currentLocation}
          title="Current Location"
        />
        <Marker
          coordinate={destination}
          title="Destination"
        />
        <Polyline
          coordinates={route.map(coord => ({
            latitude: coord[1],
            longitude: coord[0],
          }))}
          strokeColor="blue"
          strokeWidth={3}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapPage;
