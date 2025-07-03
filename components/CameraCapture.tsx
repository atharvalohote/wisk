import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

interface CameraCaptureProps {
  onImageCaptured: (base64: string, uri: string) => void;
  compress?: number; // 0-1
}

const BORDER_RADIUS = 28;
const ASPECT_RATIO = 4 / 5; // width:height

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImageCaptured,
  compress = 0.7,
}) => {
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const { width: screenWidth } = useWindowDimensions();

  // Calculate preview height based on aspect ratio
  const previewWidth = screenWidth - 48; // 24px margin on each side
  const previewHeight = Math.round(previewWidth / ASPECT_RATIO);

  React.useEffect(() => {
    (async () => {
      const { status } = await import('expo-camera').then(m => m.Camera.requestCameraPermissionsAsync());
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: compress });
      let manipulated = photo;
      if (photo.width > previewWidth || photo.height > previewHeight) {
        manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: previewWidth, height: previewHeight } }],
          { compress, base64: true }
        );
      }
      setLoading(false);
      if (manipulated.base64) {
        onImageCaptured(manipulated.base64, manipulated.uri);
      }
    }
  };

  if (hasPermission === null) {
    return <ActivityIndicator style={{ margin: 20 }} />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.previewContainer, { width: previewWidth, height: previewHeight, borderRadius: BORDER_RADIUS }]}> 
            <CameraView
          style={{ width: '100%', height: '100%', borderRadius: BORDER_RADIUS }}
              ref={cameraRef}
            />
        <View style={styles.buttonOverlay}>
              <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture} />
            </View>
        {loading && <ActivityIndicator style={{ position: 'absolute', top: '45%', alignSelf: 'center' }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
  },
  previewContainer: {
    backgroundColor: '#f5f7fa',
    overflow: 'hidden',
    position: 'relative',
        shadowColor: '#000',
    shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
    elevation: 4,
      },
  buttonOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraCapture; 