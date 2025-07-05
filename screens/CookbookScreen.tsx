import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Modal, TouchableOpacity, Dimensions, Share, Alert, ScrollView } from 'react-native';
import { Appbar, Text, Button, IconButton, useTheme } from 'react-native-paper';
import FontFamilies from '../FontFamilies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY = 'SAVED_RECIPES';

type SavedRecipe = {
  id: string;
  title: string;
  text: string;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const PASTEL_COLORS = [
  '#FFD1C1', // Peach
  '#FFB7B2', // Pink
  '#FFFACD', // Lemon
  '#B2F7EF', // Mint
  '#B2A4FF', // Blue
  '#F7B2E0', // Light Pink
  '#E0C3A3', // Wheat
];

const CookbookScreen = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchRecipes = async () => {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        setRecipes(data ? JSON.parse(data) : []);
      };
      fetchRecipes();
    }, [])
  );

  const openRecipeModal = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const closeRecipeModal = () => {
    setModalVisible(false);
  };

  const renderCarouselItem = ({ item, index }: { item: SavedRecipe; index: number }) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(item.text);
    } catch {}
    // Assign a color based on the recipe id for consistency
    const colorIndex = Math.abs(item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % PASTEL_COLORS.length;
    const cardColor = PASTEL_COLORS[colorIndex];
    return (
      <TouchableOpacity onPress={() => openRecipeModal(index)} activeOpacity={0.8} style={[styles.carouselCard, { backgroundColor: cardColor }] }>
        <Text style={[styles.carouselTitle, { fontFamily: FontFamilies.rubikBubbles }]}>{item.title}</Text>
        {parsed && parsed.ingredients && (
          <Text style={styles.carouselPreview} numberOfLines={2}>
            {parsed.ingredients.slice(0, 2).map((ing: string) => `• ${ing}`).join('  ')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleShare = async () => {
    if (!recipes[selectedIndex]) return;
    let parsed: any = null;
    try {
      parsed = JSON.parse(recipes[selectedIndex].text);
    } catch {}
    if (!parsed) return;
    const shareText = `${parsed.title}\n\nIngredients:\n${parsed.ingredients.map((i: string) => `• ${i}`).join('\n')}\n\nInstructions:\n${parsed.instructions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Alert.alert('Error', 'Could not share recipe.');
    }
  };

  const handleDelete = async () => {
    if (!recipes[selectedIndex]) return;
    const toDelete = recipes[selectedIndex].id;
    const updated = recipes.filter((r) => r.id !== toDelete);
    setRecipes(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setModalVisible(false);
  };

  const renderFullRecipe = () => {
    if (!recipes[selectedIndex]) return null;
    let parsed: any = null;
    try {
      parsed = JSON.parse(recipes[selectedIndex].text);
    } catch {}
    if (!parsed) return null;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 8, marginBottom: 8 }}>
          <IconButton
            icon="arrow-left"
            onPress={closeRecipeModal}
            size={24}
            style={{ marginRight: 4 }}
            accessibilityLabel="Back"
          />
          <Text
            style={{ flex: 1, textAlign: 'center', fontFamily: FontFamilies.rubikBubbles, fontSize: 28, color: theme.colors.primary, marginRight: 36 }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {parsed.title}
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
          <View style={{ backgroundColor: theme.colors.elevation.level2, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 8, marginBottom: 4 }}>Ingredients:</Text>
            {parsed.ingredients.map((ing: string, idx: number) => (
              <Text key={idx} style={{ fontFamily: 'AnonymousPro_400Regular', fontSize: 16, marginLeft: 8, marginBottom: 2 }}>• {ing}</Text>
            ))}
            <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 14, marginBottom: 4 }}>Instructions:</Text>
            {parsed.instructions.map((step: string, idx: number) => (
              <Text key={idx} style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 16, fontSize: 16 }}>
                <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 16 }}>{idx + 1}.</Text>
                <Text style={{ fontFamily: 'AnonymousPro_400Regular', fontSize: 16 }}> {step}</Text>
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
            <Button mode="contained" style={{ flex: 1, borderRadius: 12, marginRight: 8 }} onPress={handleShare} icon="share-variant">
              Share Recipe
            </Button>
            <Button mode="outlined" style={{ flex: 1, borderRadius: 12, marginLeft: 8 }} onPress={handleDelete} icon="delete">
              Delete Recipe
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderItem = ({ item }: { item: SavedRecipe }) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(item.text);
    } catch {}
    return (
      <View style={styles.recipeCard}>
        <Text style={[styles.recipeTitle, { fontFamily: FontFamilies.rubikBubbles }]}>{item.title}</Text>
        {parsed ? (
          <>
            <Text style={{ fontFamily: FontFamilies.lexendBold, fontSize: 16, marginTop: 6, marginBottom: 2, color: '#6C47FF' }}>Ingredients:</Text>
            {Array.isArray(parsed.ingredients) && parsed.ingredients.map((ing: string, idx: number) => (
              <Text key={idx} style={{ fontFamily: FontFamilies.monospace, fontSize: 14, color: '#333', marginLeft: 8 }}>• {ing}</Text>
            ))}
            <Text style={{ fontFamily: FontFamilies.lexendBold, fontSize: 16, marginTop: 10, marginBottom: 2, color: '#6C47FF' }}>Instructions:</Text>
            {Array.isArray(parsed.instructions) && parsed.instructions.map((step: string, idx: number) => (
              <Text key={idx} style={{ fontFamily: FontFamilies.monospace, fontSize: 14, color: '#333', marginLeft: 8 }}>{idx + 1}. {step}</Text>
            ))}
          </>
        ) : (
          <Text style={styles.recipeText}>{item.text}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <Appbar.Header elevated>
        <Appbar.Content title="Cookbook" titleStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26, letterSpacing: 0.5 }} />
      </Appbar.Header>
      {recipes.length === 0 ? (
        <Text style={styles.text}>No recipes in your cookbook yet.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id + '-carousel'}
          renderItem={renderCarouselItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalList}
          style={{ marginBottom: 16 }}
        />
      )}
      <Modal visible={modalVisible} animationType="fade" onRequestClose={closeRecipeModal}>
        {renderFullRecipe()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  verticalList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'stretch',
  },
  carouselCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'stretch',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0C3A3',
  },
  carouselTitle: {
    fontFamily: FontFamilies.rubikBubbles,
    fontSize: 20,
    color: '#FF6B8B',
    marginBottom: 6,
  },
  carouselPreview: {
    fontFamily: FontFamilies.lexendRegular,
    fontSize: 15,
    color: '#7A4F01',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recipeTitle: {
    fontFamily: FontFamilies.rubikBubbles,
    fontSize: 20,
    marginBottom: 8,
    color: '#6C47FF',
  },
  recipeText: {
    fontFamily: FontFamilies.monospace,
    fontSize: 14,
    color: '#333',
  },
  text: {
    fontFamily: FontFamilies.lexendRegular,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
  fullHeader: {
    marginBottom: 12,
  },
  fullTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: '#FF6B8B',
    textAlign: 'center',
    marginBottom: 8,
  },
  fullSection: {
    marginTop: 18,
  },
  fullSectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#2A1C14',
    marginBottom: 6,
  },
  fullSectionText: {
    fontFamily: 'AnonymousPro_400Regular',
    fontSize: 16,
    color: '#2A1C14',
    marginLeft: 8,
    marginBottom: 4,
  },
  fullButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  fullButton: {
    flex: 1,
    borderRadius: 14,
    marginHorizontal: 6,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CookbookScreen; 