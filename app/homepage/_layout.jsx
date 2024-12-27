import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  const bgColor = '#E0F7FA'; // Background color from the weather screen
  const activeColor = '#009688'; // Accent color from the weather screen
  const inactiveColor = '#555'; // Inactive icon color
  const iconBgColor = 'white'; // White background for icons

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          height: 80,
          paddingBottom: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="main"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <View
              style={{
                backgroundColor: iconBgColor,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                height: 50,
                width: 50,
                marginTop: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <FontAwesome name="home" size={size} color={focused ? activeColor : inactiveColor} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <View
              style={{
                backgroundColor: iconBgColor,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                height: 50,
                width: 50,
                marginTop: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <FontAwesome name="list" size={size} color={focused ? activeColor : inactiveColor} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
