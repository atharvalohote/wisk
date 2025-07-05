import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import FontFamilies from '../FontFamilies';
import { useFonts, RubikBubbles_400Regular } from '@expo-google-fonts/rubik-bubbles';

interface WelcomeScreenProps {
  onFinish: () => void;
}

const INSTRUCTIONS = [
  'Welcome to Wisk!',
  'Scan your ingredients or enter them manually.',
  'Generate recipes instantly and save your favorites!',
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFinish }) => {
  const videoRef = useRef<Video>(null);
  const { width, height } = Dimensions.get('window');
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [buttonLabel, setButtonLabel] = useState('Get Started');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({ RubikBubbles_400Regular });
  const [screenOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    // After 5 seconds or when instructions finish, change button to 'Skip'
    const skipTimeout = setTimeout(() => setButtonLabel('Skip'), 5000);
    // Instruction sequence
    let instructionTimeout: NodeJS.Timeout;
    instructionTimeout = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setInstructionIndex(idx => (idx + 1) % INSTRUCTIONS.length);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2200);
    return () => {
      clearTimeout(skipTimeout);
      if (instructionTimeout) clearTimeout(instructionTimeout);
    };
  }, [instructionIndex]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  const handleGetStarted = () => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        onFinish();
      }, 200);
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}> 
      <Video
        ref={videoRef}
        source={require('../assets/welcome.mp4')}
        style={{ width, height }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={true}
        onPlaybackStatusUpdate={() => {}}
        isMuted={false}
        useNativeControls={false}
        pointerEvents="none"
      />
      <Animated.View style={[styles.instructionOverlay, { opacity: fadeAnim }]}> 
        <Text style={[styles.instructionText, { fontFamily: 'RubikBubbles_400Regular', fontWeight: undefined, fontStyle: undefined, color: '#fff' }]}>{INSTRUCTIONS[instructionIndex]}</Text>
      </Animated.View>
      <TouchableOpacity style={styles.bottomButton} onPress={handleGetStarted} activeOpacity={0.8}>
        <Text style={[styles.bottomButtonText, { fontFamily: 'RubikBubbles_400Regular', fontWeight: undefined, fontStyle: undefined, color: '#fff' }]}>{buttonLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionOverlay: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  instructionText: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1.2,
    marginBottom: 8,
    fontFamily: 'RubikBubbles_400Regular',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 48,
    left: '10%',
    right: '10%',
    backgroundColor: '#FFBFAE',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 1.2,
    fontFamily: 'RubikBubbles_400Regular',
  },
});

export default WelcomeScreen; 