import React, { useContext } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Appbar, Card, Switch, List, useTheme, Button } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontFamilies from '../FontFamilies';
import { ThemeContext, HapticsContext } from '../Contexts';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY = 'SAVED_RECIPES';

const SettingsScreen = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { isDark, setIsDark } = useContext(ThemeContext);
  const { hapticsEnabled, setHapticsEnabled } = useContext(HapticsContext);

  const handleThemeToggle = async () => {
    Haptics.selectionAsync();
    setIsDark(!isDark);
    AsyncStorage.setItem('APP_THEME_DARK', (!isDark).toString());
  };

  const handleHapticsToggle = async () => {
    setHapticsEnabled(!hapticsEnabled);
    AsyncStorage.setItem('HAPTICS_ENABLED', (!hapticsEnabled).toString());
    Haptics.selectionAsync();
  };

  const handleClearRecipes = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background, flex: 1 }] }>
        <Appbar.Header elevated>
          <Appbar.Content title="Settings" titleStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 24, letterSpacing: 0.5 }} />
        </Appbar.Header>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.outerScrollContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.centered}>
              <BlurView style={[
                styles.blurCard,
                {
                  width: Math.min(width - 24, 600),
                  maxWidth: 600,
                  alignSelf: 'center',
                  marginHorizontal: 12,
                },
              ]} intensity={24} tint={theme.dark ? 'dark' : 'light'}>
                <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2, width: '100%', alignSelf: 'stretch', elevation: 0, shadowColor: 'transparent' }] }>
                  <Card.Content>
                    <List.Item
                      title="Dark Theme"
                      titleStyle={[styles.text, { fontFamily: FontFamilies.rubikBubbles, fontSize: 20 }]}
                      right={() => (
                        <Switch 
                          value={isDark} 
                          onValueChange={handleThemeToggle} 
                          color={theme.colors.primary}
                          accessibilityLabel="Toggle dark theme"
                        />
                      )}
                    />
                    <List.Item
                      title="Enable Haptics"
                      titleStyle={[styles.text, { fontFamily: FontFamilies.rubikBubbles, fontSize: 20 }]}
                      right={() => (
                        <Switch 
                          value={hapticsEnabled} 
                          onValueChange={handleHapticsToggle} 
                          color={theme.colors.primary}
                          accessibilityLabel="Toggle haptics"
                        />
                      )}
                    />
                    <Button mode="outlined" onPress={handleClearRecipes} style={styles.button} labelStyle={styles.text}>
                      Clear Cookbook
                    </Button>
                  </Card.Content>
                </Card>
              </BlurView>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  centered: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
  blurCard: {
    borderRadius: 28,
    overflow: 'hidden',
    margin: 0,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingVertical: 16,
  },
  card: {
    borderRadius: 28,
    minWidth: 320,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
  },
  text: {
    fontFamily: FontFamilies.rubikBubbles,
    fontSize: 18,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
  outerScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
});

export default SettingsScreen; 