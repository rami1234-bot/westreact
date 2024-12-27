import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';

export default function WeatherScreen() {
  const [loc, setLoc] = useState('');
  const [data, setData] = useState(null);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState('');

  const API = '00c73b2707a6d86446e4277767ee4247';

  const getWeather = async () => {
    if (loc.trim() === '') {
      setErr('Location cannot be empty.');
      return;
    }
    setErr('');
    setLoad(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${API}`
      );
      const json = await res.json();
      if (json.cod === 200) {
        setData(json);
      } else {
        setErr(json.message || 'Failed to fetch data.');
      }
    } catch {
      setErr('An error occurred. Try again.');
    } finally {
      setLoad(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.c} behavior="padding">
      <TextInput
        style={styles.s}
        placeholder="Enter a location"
        value={loc}
        onChangeText={setLoc}
      />
      <TouchableOpacity style={styles.b} onPress={getWeather}>
        <Text style={styles.bt}>Search</Text>
      </TouchableOpacity>
      {err ? <Text style={styles.e}>{err}</Text> : null}
      {load ? (
        <ActivityIndicator size="large" color="#009688" />
      ) : data ? (
        <View style={styles.w}>
          <Text style={styles.t}>{data.name}</Text>
          <Text style={styles.i}>{data.weather[0].description}</Text>
          <Text style={styles.tmp}>{Math.round(data.main.temp)}°C</Text>
          <Text style={styles.d}>
            Humidity: {data.main.humidity}% | Wind: {data.wind.speed} m/s
          </Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  s: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: 'white',
    marginBottom: 10,
    marginTop: 30, // Add margin to move the search bar down
  },
  b: {
    backgroundColor: '#009688',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10, // Add margin to move the search button down
  },
  bt: {
    color: 'white',
    fontWeight: 'bold',
  },
  e: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
  },
  w: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  t: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009688',
    marginBottom: 10,
  },
  i: {
    fontSize: 18,
    color: '#555',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  tmp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  d: {
    fontSize: 16,
    color: '#555',
  },
});

