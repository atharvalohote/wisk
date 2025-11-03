import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AuthService from '../services/AuthService';
import FontFamilies from '../FontFamilies';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = AuthService.isAuthenticated;

      if (!authStatus) {
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthScreen' }],
            })
          );
        }, 100);
      } else {
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    const timer = setTimeout(checkAuthStatus, 1000); // Small delay for smooth UI

    return () => clearTimeout(timer);
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={[styles.loadingText, { fontFamily: FontFamilies.rubikBubbles }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={[styles.loadingText, { fontFamily: FontFamilies.rubikBubbles }]}>
          Redirecting to login...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6C47FF',
  },
});

export default AuthGuard;