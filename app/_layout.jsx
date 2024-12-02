import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

// Exporting ErrorBoundary for error handling in the navigation tree.
export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Handle any errors in loading fonts.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide the splash screen when fonts are loaded.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Return null while fonts are loading.
  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
      <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false  }} // Hide header for Homepage
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="homepage" 
          options={{ headerShown: false  }} // Hide header for Homepage
        />
      </Stack>
    </ThemeProvider>
  );
}
