import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface ImageCarouselProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onChange }) => {
  const theme = useTheme();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      onChange([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {images.map((uri, idx) => (
          <View key={uri} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <IconButton
              icon="close"
              size={18}
              style={styles.removeButton}
              onPress={() => removeImage(idx)}
              accessibilityLabel="Remove image"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    marginVertical: 8,
    paddingHorizontal: 0,
  },
  scrollView: {
    width: '100%',
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 0,
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    height: 72,
    alignSelf: 'center',
  },
});

export default ImageCarousel; 