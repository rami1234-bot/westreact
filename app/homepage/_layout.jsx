import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const darkBlue = '#0E415E'; // Dark blue background
  const yellow = '#FEAD1C'; // Yellow icon color

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: yellow, // Set active icon color to yellow
        tabBarStyle: {
          backgroundColor: darkBlue, // Set the entire tab bar background to dark blue
          height: 80, // Set a taller fixed height for the tab bar (increased thickness)
          paddingBottom: 10, // Adjust bottom padding for better vertical positioning
        },
        headerShown: false, // Hide headers for all screens
      }}>
      <Tabs.Screen
        name="main"
        options={{
          tabBarIcon: ({ size }) => (
            <View style={{
              backgroundColor: darkBlue,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              height: 50, // Icon size remains the same
              width: 50, // Icon size remains the same
              marginTop: 10, // Adjust the top margin to keep the icon vertically centered
            }}>
              <FontAwesome name="home" size={size} color={yellow} />
            </View>
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="checkpoints"
        options={{
          tabBarIcon: ({ size }) => (
            <View style={{
              backgroundColor: darkBlue,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
              width: 50,
              marginTop: 10, // Adjust the top margin to keep the icon vertically centered
            }}>
              <FontAwesome name="map-marker" size={size} color={yellow} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ size }) => (
            <View style={{
              backgroundColor: darkBlue,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
              width: 50,
              marginTop: 10, // Adjust the top margin to keep the icon vertically centered
            }}>
              <FontAwesome name="globe" size={size} color={yellow} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ size }) => (
            <View style={{
              backgroundColor: darkBlue,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
              width: 50,
              marginTop: 10, // Adjust the top margin to keep the icon vertically centered
            }}>
              <FontAwesome name="cog" size={size} color={yellow} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
