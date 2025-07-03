import React, { createContext, useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import TabNavigator from './navigation/TabNavigator';
import { useColorScheme, Text } from 'react-native';
import { useFonts as useAnonymousProFonts, AnonymousPro_400Regular } from '@expo-google-fonts/anonymous-pro';
import { useFonts as useLexendFonts, Lexend_700Bold, Lexend_400Regular } from '@expo-google-fonts/lexend';
import RecipeView from './screens/RecipeDialogScreen';
import RecipeTextScreen from './screens/RecipeTextScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, HapticsContext } from './Contexts';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    (async () => {
      const dark = await AsyncStorage.getItem('APP_THEME_DARK');
      setIsDark(dark === 'true');
      const haptics = await AsyncStorage.getItem('HAPTICS_ENABLED');
      setHapticsEnabled(haptics !== 'false');
    })();
  }, []);

  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  // Load the fonts
  const [anonLoaded] = useAnonymousProFonts({
    AnonymousPro_400Regular,
  });
  const [lexendLoaded] = useLexendFonts({
    Lexend_700Bold,
    Lexend_400Regular,
  });

  if (!anonLoaded || !lexendLoaded) {
    return <Text>Loading...</Text>;
  }

  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
  }

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
    </PaperProvider>
      </HapticsContext.Provider>
    </ThemeContext.Provider>
  );
}
