import React, { useContext, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, Alert } from 'react-native';
import { Appbar, Card, Switch, List, useTheme, Button, Avatar, Divider, Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontFamilies from '../FontFamilies';
import { ThemeContext, HapticsContext } from '../Contexts';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

const STORAGE_KEY = 'SAVED_RECIPES';

const SettingsScreen = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { isDark, setIsDark } = useContext(ThemeContext);
  const { hapticsEnabled, setHapticsEnabled } = useContext(HapticsContext);
  const navigation = useNavigation();

  const currentUser = AuthService.currentUser;

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
    Alert.alert(
      'Clear Cookbook',
      'Are you sure you want to clear all saved recipes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'All recipes cleared');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await AuthService.signOut();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AuthScreen' }],
                })
              );
            } catch (error: any) {
              Alert.alert('Error', 'Failed to sign out');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }
        }
      ]
    );
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
                    {/* User Profile Section */}
                    {currentUser && (
                      <>
                        <View style={styles.profileSection}>
                          <Avatar.Icon
                            size={60}
                            icon="account"
                            style={{ backgroundColor: '#FFBFAE' }}
                          />
                          <View style={styles.profileText}>
                            <Text style={[styles.userName, { fontFamily: FontFamilies.rubikBubbles }]}>
                              {currentUser.displayName || 'User'}
                            </Text>
                            <Text style={styles.userEmail}>{currentUser.email}</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                      </>
                    )}

                    {/* App Settings */}
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
                    <Divider style={styles.divider} />

                    {/* Data Management */}
                    <Button mode="outlined" onPress={handleClearRecipes} style={[styles.button, { marginBottom: 12 }]} labelStyle={styles.text}>
                      Clear Cookbook
                    </Button>

                    {/* Authentication */}
                    {currentUser && (
                      <Button
                        mode="contained"
                        onPress={handleLogout}
                        style={[styles.button, styles.logoutButton]}
                        labelStyle={[styles.text, { color: 'white' }]}
                        buttonColor="#d32f2f"
                      >
                        Sign Out
                      </Button>
                    )}
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
  logoutButton: {
    marginTop: 8,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
});

export default SettingsScreen; 