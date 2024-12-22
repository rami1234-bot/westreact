import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Button, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import { getDatabase, ref, onValue } from 'firebase/database'; // Firebase imports
import { firebaseApp } from '../../firebase'; // Firebase config import
import axios from 'axios'; // Import axios to fetch traffic data
import * as Location from 'expo-location'; // Import expo-location
// Set up Google Maps API key
Geocoder.init("AIzaSyAEh6UQ_XwrAed-7OdB8jmidJ7XmkO9lHI");

export default function MapScreen() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [distance, setDistance] = useState(null); // Distance state
  const [duration, setDuration] = useState(null); // Duration state
  const [trafficLevel, setTrafficLevel] = useState(''); // New state to store traffic level
  const [checkpoints, setCheckpoints] = useState([]);
  const [error, setError] = useState('');
  const mapRef = useRef(null); // Create a reference for the MapView
  const [userLocation, setUserLocation] = useState(null); 

  // Fetch data from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const checkpointsRef = ref(db, 'checkpoints');

    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync(); // Request permission

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({}); // Get current location
        setUserLocation(location.coords); // Set the user's location
        // Zoom into the user's location once it's available
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          }, 1000); // Animate the zoom
        }
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to view your location.');
      }
    };

    getLocation();
  
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

      setCheckpoints(checkpointList);
    });
  }, []);

  const handleNavigation = async () => {
    try {
      const startResponse = await Geocoder.from(startLocation);
      const startLatLng = startResponse.results[0].geometry.location;
      setStartCoords({
        latitude: startLatLng.lat,
        longitude: startLatLng.lng,
      });

      const endResponse = await Geocoder.from(endLocation);
      const endLatLng = endResponse.results[0].geometry.location;
      setEndCoords({
        latitude: endLatLng.lat,
        longitude: endLatLng.lng,
      });

      setError(''); // Clear any previous errors
      setDuration(null); // Reset duration when starting a new navigation
      setDistance(null); // Reset distance

      // Fetch traffic data and check for closed checkpoints
      const routeResponse = await fetchTrafficData(startLatLng, endLatLng);
      const closedCheckpoints = await findClosedCheckpoints(routeResponse, checkpoints);

      if (closedCheckpoints.length > 0) {
        // If there are closed checkpoints, reroute
        alert(`Route goes through closed checkpoints: ${closedCheckpoints.map(cp => cp.name).join(', ')}`);
        reroute(startLatLng, endLatLng, closedCheckpoints);
      }

    } catch (error) {
      setError('Invalid location');
    }
  };

  const fetchTrafficData = async (startLatLng, endLatLng) => {
    const API_KEY = "AIzaSyAEh6UQ_XwrAed-7OdB8jmidJ7XmkO9lHI";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLatLng.lat},${startLatLng.lng}&destination=${endLatLng.lat},${endLatLng.lng}&departure_time=now&traffic_model=best_guess&key=${API_KEY}`;

    // Modify the Doroob API URL
  //  const url = `https://apiv1.doroob.net/route/find?lat1=${startLatLng.lat}&lng1=${startLatLng.lng}&lat2=${endLatLng.lat}&lng2=${endLatLng.lng}&instructions=true&types=fastest,shortest,doroob`;
    try {
      const response = await axios.get(url);
      return response.data.routes[0]; // Return the whole route object for further processing
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      setTrafficLevel('no_traffic_data');
    }
  };

  // Function to check for closed checkpoints in the route
  const findClosedCheckpoints = async (routeData, checkpoints) => {
    const closedCheckpoints = checkpoints.filter(checkpoint => checkpoint.availability === 'closed');
    const routeCoordinates = routeData.legs[0].steps.map(step => ({
      latitude: step.start_location.lat,
      longitude: step.start_location.lng,
    }));

    // Check if any of the route coordinates are near the closed checkpoints
    return closedCheckpoints.filter(checkpoint => {
      return routeCoordinates.some(coord => {
        const distance = getDistance(coord, {
          latitude: checkpoint.latitude,
          longitude: checkpoint.longitude,
        });
        return distance < 100; // Check within 100 meters radius
      });
    });
  };

  // Helper function to calculate distance (Haversine formula or similar)
  const getDistance = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  };

  const reroute = async (startLatLng, endLatLng, closedCheckpoints) => {
    // Remove closed checkpoints from the navigation logic
    alert(`Rerouting to avoid: ${closedCheckpoints.map(cp => cp.name).join(', ')}`);
    const openCheckpoints = checkpoints.filter(cp => cp.availability === 'open');
    // You may want to filter or create a new route based on the available checkpoints if needed
    // Here, simply call the fetchTrafficData again for new directions
    await fetchTrafficData(startLatLng, endLatLng);
  };

  // Function to format duration into hours and minutes
  const formatDuration = (durationInMinutes) => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Determine stroke color based on traffic level
  const getStrokeColor = () => {
    switch (trafficLevel) {
      case 'light':
        return '#00FF00'; // Green for light traffic
      case 'moderate':
        return '#FFFF00'; // Yellow for moderate traffic
      case 'heavy':
        return '#FFA500'; // Orange for heavy traffic
      case 'severe':
        return '#FF0000'; // Red for severe traffic
      default:
        return '#FEAD1C'; // Default secondary color if no traffic data
    }
  };

  // Function to determine the pin color based on checkpoint status
  const getCheckpointPinColor = (status) => {
    switch (status) {
      case 'open':
        return 'green';
      case 'closed':
        return 'red';
      case 'under_maintenance':
        return 'orange';
      default:
        return 'blue'; // Default color for unknown status
    }
  };

  // This function will be called when the route is ready
  const handleRouteReady = (result) => {
    setDuration(result.duration); // Set the duration from the route
    setDistance(result.distance); // Set the distance from the route

    // Calculate the midpoint between start and end coordinates
    const midpoint = {
      latitude: (startCoords.latitude + endCoords.latitude) / 2,
      longitude: (startCoords.longitude + endCoords.longitude) / 2,
    };

    // Zoom into the midpoint
    mapRef.current.animateToRegion({
      ...midpoint,
      latitudeDelta: 0.04, // Adjust zoom level (smaller delta = closer zoom)
      longitudeDelta: 0.04,
    }, 1000); // Animation duration in milliseconds
  };

  return (
    <View style={styles.container}>
      {/* Map rendering */}
      <MapView
        ref={mapRef} // Attach the ref to the MapView
        style={styles.map}
        initialRegion={{
          latitude: 31.7683,
          longitude: 35.2137,
          latitudeDelta: 0.04,
          longitudeDelta: 0.05,
        }}
      >
        {/* Start and end markers with pink pins */}
        {startCoords && (
          <Marker
            coordinate={startCoords}
            title="Start Location"
            pinColor="#FFC0CB" // Pink marker
          />
        )}
        {endCoords && (
          <Marker
            coordinate={endCoords}
            title="End Location"
            pinColor="#FFC0CB" // Pink marker
          />
        )}

        {/* Checkpoints markers */}
        {checkpoints.map(checkpoint => (
          <Marker
            key={checkpoint.id}
            coordinate={{ latitude: checkpoint.latitude, longitude: checkpoint.longitude }}
            pinColor={getCheckpointPinColor(checkpoint.availability)}
          >
            <Callout>
              <Text>{checkpoint.name} ({checkpoint.availability})</Text>
            </Callout>
          </Marker>
        ))}

        {/* Directions polyline */}
        {startCoords && endCoords && (
          <MapViewDirections
            origin={startCoords}
            destination={endCoords}
            apikey="AIzaSyAEh6UQ_XwrAed-7OdB8jmidJ7XmkO9lHI"
            strokeWidth={3}
            strokeColor={getStrokeColor()}
            mode="DRIVING"
            onReady={handleRouteReady} // Handle when route is ready
            timePrecision="now" // Specify that you want live traffic data
          />
        )}
      </MapView>

      {/* Input fields at the bottom */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Start Location"
          style={styles.input}
          value={startLocation}
          onChangeText={setStartLocation}
        />
        <TextInput
          placeholder="End Location"
          style={styles.input}
          value={endLocation}
          onChangeText={setEndLocation}
        />
        <Button title="Navigate" onPress={handleNavigation} />
      </View>

      {/* Error message display */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Display distance and duration */}
      {distance && duration && (
        <View style={styles.infoContainer}>
          <Text>Distance: {distance.toFixed(2)} km</Text>
          <Text>Duration: {formatDuration(duration)} (minutes)</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 20, // Adjust margin to move the input down
    position: 'absolute', // Positioning the input container
    bottom: 581, // Align to the bottom with a bit of space
    left: 0,
    right: 0,
    // Add some elevation if desired for better visibility
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
});
