import React, { useContext } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Appbar, Card, Switch, List, useTheme, Button } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontFamilies from '../FontFamilies';
import { ThemeContext, HapticsContext } from '../Contexts';
import { BlurView } from 'expo-blur';

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <Appbar.Header elevated>
        <Appbar.Content title="Settings" titleStyle={{ fontFamily: FontFamilies.lexendBold, fontSize: 22, letterSpacing: 0.5 }} />
      </Appbar.Header>
      <View style={styles.centered}>
        <BlurView style={[styles.blurCard, { width: width - 24, maxWidth: 600, alignSelf: 'center' }]} intensity={24} tint={theme.dark ? 'dark' : 'light'}>
          <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2, width: '100%', alignSelf: 'stretch' }] }>
            <Card.Content>
              <List.Item
                title="Dark Theme"
                titleStyle={styles.text}
                right={() => (
                  <Switch value={isDark} onValueChange={handleThemeToggle} />
                )}
              />
        <List.Item
                title="Enable Haptics"
          titleStyle={styles.text}
          right={() => (
                  <Switch value={hapticsEnabled} onValueChange={handleHapticsToggle} />
          )}
        />
              <Button mode="outlined" onPress={handleClearRecipes} style={styles.button} labelStyle={styles.text}>
                Clear Cookbook
              </Button>
            </Card.Content>
          </Card>
        </BlurView>
      </View>
    </View>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    borderRadius: 28,
    minWidth: 320,
    maxWidth: 600,
    elevation: 4,
    width: '100%',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  text: {
    fontFamily: FontFamilies.lexendRegular,
    fontSize: 18,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
});

export default SettingsScreen; 