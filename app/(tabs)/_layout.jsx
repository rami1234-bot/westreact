import React from 'react';
import { View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      {/* Line separating the tab bar from the screens */}
      <View
        style={{
          height: 4, // Increased height for a thicker line
          backgroundColor: '#009688', // Teal color for the line
        }}
      />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#009688', // Teal color for active icons
          tabBarStyle: {
            backgroundColor: '#E0F7FA', // Light blue background for the tab bar
            paddingBottom: 10, // Optional: Keep bottom padding if needed
            paddingTop: 20, // Increase top padding for more space above the tab bar
            height: 70, // Optional: Increase height of the tab bar for a more pronounced look
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Login',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="sign-in" size={28} color={color} style={{ marginBottom: -3 }} />
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
          name="two"
          options={{
            title: 'SignUp',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-plus" size={28} color={color} style={{ marginBottom: -3 }} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
