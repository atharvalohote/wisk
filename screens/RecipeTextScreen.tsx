import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Appbar, Button, Text, useTheme, Snackbar, Dialog, Portal } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import FontFamilies from '../FontFamilies';

const STORAGE_KEY = 'SAVED_RECIPES';

const RecipeTextScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  // Accept recipe as a JSON object or string
  let recipe = (route.params as any)?.recipe;
  // Try to parse if it's a stringified JSON
  if (typeof recipe === 'string') {
    try {
      const parsed = JSON.parse(recipe);
      if (parsed && typeof parsed === 'object' && parsed.title && parsed.ingredients && parsed.instructions) {
        recipe = parsed;
      }
    } catch {}
  }
  const [dialogVisible, setDialogVisible] = useState(false);
  if (!recipe || typeof recipe !== 'object' || !recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No recipe found.</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const recipes = data ? JSON.parse(data) : [];
      let title = typeof recipe.title === 'string' && recipe.title.trim() ? recipe.title.trim() : 'Cookbook';
      let text;
      try {
        text = JSON.stringify(recipe, null, 2);
      } catch (e) {
        text = String(recipe);
      }
      const newRecipe = { id: uuid.v4(), title, text };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newRecipe, ...recipes]));
      setDialogVisible(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to save recipe.');
    }
  };

  const handleRegenerate = () => {
    navigation.goBack(); // Go back to PromptScreen to regenerate
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Recipe" titleStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26 }} />
      </Appbar.Header>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View style={{ backgroundColor: theme.colors.elevation.level2, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26, marginBottom: 12, color: theme.colors.primary }}>{recipe.title}</Text>
          <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 8, marginBottom: 4 }}>Ingredients:</Text>
          {recipe.ingredients.map((ing: string, idx: number) => (
            <Text key={idx} style={{ fontFamily: 'AnonymousPro_400Regular', fontSize: 16, marginLeft: 8, marginBottom: 2 }}>• {ing}</Text>
          ))}
          <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 14, marginBottom: 4 }}>Instructions:</Text>
          {recipe.instructions.map((step: string, idx: number) => (
            <Text key={idx} style={{ flexDirection: 'row', marginLeft: 8, marginBottom: 16, fontSize: 16 }}>
              <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 16 }}>{idx + 1}.</Text>
              <Text style={{ fontFamily: 'AnonymousPro_400Regular', fontSize: 16 }}> {step}</Text>
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          <Button mode="contained" style={{ flex: 1, borderRadius: 12, marginRight: 8 }} onPress={handleSave}>
            Save Recipe
          </Button>
          <Button mode="outlined" style={{ flex: 1, borderRadius: 12, marginLeft: 8 }} onPress={handleRegenerate}>
            Regenerate Recipe
          </Button>
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ alignSelf: 'center', backgroundColor: theme.colors.elevation.level2, width: 260, borderRadius: 18, paddingVertical: 8, minHeight: 120, justifyContent: 'flex-end' }}>
            <Dialog.Title style={{ color: theme.colors.primary, fontFamily: FontFamilies.rubikBubbles, textAlign: 'center', fontSize: 20, marginBottom: 0, marginTop: 8, paddingBottom: 0 }}>Recipe saved!</Dialog.Title>
            <Dialog.Content style={{ paddingBottom: 48, marginBottom: 0 }}>
              <Text style={{ fontFamily: 'AnonymousPro_400Regular', fontSize: 15, textAlign: 'center', marginBottom: 0 }}>You can find this recipe in your cookbook.</Text>
            </Dialog.Content>
            <Dialog.Actions style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingBottom: 10,
              backgroundColor: 'transparent',
            }}>
              <Button
                onPress={() => setDialogVisible(false)}
                style={{ flex: 1, backgroundColor: 'rgba(255,75,75,0.65)', borderRadius: 10, marginRight: 6, height: 38, justifyContent: 'center' }}
                labelStyle={{ color: '#fff', fontFamily: 'Lexend_700Bold', fontSize: 15 }}
                mode="contained"
              >
                Cancel
              </Button>
              <Button
                onPress={() => setDialogVisible(false)}
                style={{ flex: 1, backgroundColor: 'rgba(46,204,64,0.65)', borderRadius: 10, marginLeft: 6, height: 38, justifyContent: 'center' }}
                labelStyle={{ color: '#fff', fontFamily: 'Lexend_700Bold', fontSize: 15 }}
                mode="contained"
              >
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
};

export default RecipeTextScreen; 