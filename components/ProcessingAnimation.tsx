import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const SQUIRCLE_SIZE = 180;
const VIDEO_ZOOM = 1.2;

const ProcessingAnimation: React.FC = () => {
  const player: any = useVideoPlayer(require('../assets/processing.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={styles.squircle}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  squircle: {
    width: SQUIRCLE_SIZE,
    height: SQUIRCLE_SIZE,
    borderRadius: 40, // Squircle effect
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },
  video: {
    width: SQUIRCLE_SIZE * VIDEO_ZOOM,
    height: SQUIRCLE_SIZE * VIDEO_ZOOM,
    position: 'absolute',
    top: (SQUIRCLE_SIZE - SQUIRCLE_SIZE * VIDEO_ZOOM) / 2,
    left: (SQUIRCLE_SIZE - SQUIRCLE_SIZE * VIDEO_ZOOM) / 2,
  },
});

export default ProcessingAnimation; 