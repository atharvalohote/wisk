import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import TabNavigator from './navigation/TabNavigator';
import { useColorScheme, Text, Animated } from 'react-native';
import { useFonts as useRubikBubblesFonts, RubikBubbles_400Regular } from '@expo-google-fonts/rubik-bubbles';
import RecipeView from './screens/RecipeDialogScreen';
import RecipeTextScreen from './screens/RecipeTextScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, HapticsContext } from './Contexts';
import AppColors from './AppColors';
import { AppColorsDark } from './AppColors';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const welcomeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const dark = await AsyncStorage.getItem('APP_THEME_DARK');
      setIsDark(dark === 'true');
      const haptics = await AsyncStorage.getItem('HAPTICS_ENABLED');
      setHapticsEnabled(haptics !== 'false');
    })();
  }, []);

  // Merge AppColors into the PaperProvider theme
  const customLightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...AppColors,
    },
  };
  const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...AppColorsDark,
    },
  };
  const paperTheme = isDark ? customDarkTheme : customLightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  // Load only Rubik Bubbles font
  const [rubikLoaded] = useRubikBubblesFonts({
    RubikBubbles_400Regular,
  });
  if (!rubikLoaded) {
    return <Text>Loading...</Text>;
  }

  // Fade out WelcomeScreen and unmount after animation
  const handleWelcomeFinish = () => {
    Animated.timing(welcomeOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowWelcome(false));
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <HapticsContext.Provider value={{ hapticsEnabled, setHapticsEnabled }}>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="RecipeView" component={RecipeView} />
              <Stack.Screen name="RecipeTextScreen" component={RecipeTextScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          {showWelcome && (
            <Animated.View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              backgroundColor: 'transparent',
              opacity: welcomeOpacity,
            }}>
              <WelcomeScreen onFinish={handleWelcomeFinish} />
            </Animated.View>
          )}
        </PaperProvider>
      </HapticsContext.Provider>
    </ThemeContext.Provider>
  );
}
