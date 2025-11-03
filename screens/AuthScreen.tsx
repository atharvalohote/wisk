import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useWindowDimensions } from 'react-native';
import AuthService, { UserProfile } from '../services/AuthService';
import FontFamilies from '../FontFamilies';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AuthScreen'>;

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<AuthScreenNavigationProp>();

  useEffect(() => {
    if (AuthService.currentUser) {
      navigation.replace('MainTabs' as any);
    }
  }, [navigation]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (isSignUp) {
        await AuthService.signUp(email, password, displayName);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await AuthService.signIn(email, password);
        Alert.alert('Success', 'Welcome back!');
      }

      navigation.replace('MainTabs' as any);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In requires additional configuration. Please set up Google Sign-In in your Firebase console.',
      [{ text: 'OK' }]
    );
  };

  const toggleAuthMode = () => {
    Haptics.selectionAsync();
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.overlayContainer}>
        <BlurView intensity={30} tint={theme.dark ? 'dark' : 'light'} style={styles.blurContainer}>
          <View style={styles.content}>
            {/* Logo/Title */}
            <View style={styles.headerContainer}>
              <Avatar.Icon
                size={80}
                icon="cookie"
                style={{ backgroundColor: '#FFBFAE' }}
              />
              <Text style={[styles.title, { fontFamily: FontFamilies.rubikBubbles, color: theme.colors.primary }]}>
                Welcome to Wisk
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
                {isSignUp ? 'Create your account' : 'Sign in to continue'}
              </Text>
            </View>

            {/* Auth Card */}
            <Card style={[styles.authCard, { backgroundColor: theme.colors.elevation.level2 }]}>
              <Card.Content style={styles.cardContent}>
                {isSignUp && (
                  <TextInput
                    label="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                    autoCapitalize="words"
                  />
                )}

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  autoComplete="password"
                />

                <Button
                  mode="contained"
                  onPress={handleAuth}
                  loading={loading}
                  disabled={loading}
                  style={[styles.button, { backgroundColor: '#FFBFAE' }]}
                  contentStyle={styles.buttonContent}
                  labelStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                  {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>

                {/* Google Sign-In Button */}
                <Button
                  mode="outlined"
                  onPress={handleGoogleSignIn}
                  style={[styles.button, styles.googleButton]}
                  contentStyle={styles.buttonContent}
                  icon="google"
                >
                  Continue with Google
                </Button>

                {/* Toggle Auth Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={{ color: theme.colors.onSurface }}>
                    {isSignUp ? 'Already have an account?' "Don't have an account?"}
                  </Text>
                  <Button
                    mode="text"
                    onPress={toggleAuthMode}
                    compact
                    labelStyle={{ color: '#6C47FF', fontWeight: 'bold' }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  authCard: {
    width: '100%',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
    borderRadius: 12,
  },
  googleButton: {
    borderColor: '#4285F4',
  },
  buttonContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default AuthScreen;