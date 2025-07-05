import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontFamilies from '../FontFamilies';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipeView = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const route = useRoute();
  const { recipe } = (route.params as any) || {};

  const STORAGE_KEY = 'SAVED_RECIPES';

  const saveRecipe = async () => {
    if (!recipe || !recipe.id) return;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let saved = data ? JSON.parse(data) : [];
      if (!saved.find((r: any) => r.id === recipe.id)) {
        saved = [recipe, ...saved];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Recipe" titleStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26, letterSpacing: 0.5 }} />
        {recipe && recipe.id && (
          <Appbar.Action icon="menu-book-plus" onPress={saveRecipe} />
        )}
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView style={styles.blurCard} intensity={28} tint={theme.dark ? 'dark' : 'light'}>
          <View style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }] }>
            <Text style={[styles.title, { fontFamily: FontFamilies.rubikBubbles, fontSize: 28 }]}>{recipe?.title || 'Recipe'}</Text>
            <Text style={[styles.section, { fontFamily: FontFamilies.rubikBubbles, fontSize: 20 }]}>Ingredients</Text>
            {Array.isArray(recipe?.ingredients) && recipe.ingredients.map((item: string, idx: number) => (
              <Text key={idx} style={styles.ingredient}>• {item}</Text>
            ))}
            <Text style={[styles.section, { fontFamily: FontFamilies.rubikBubbles, fontSize: 20 }]}>Instructions</Text>
            {Array.isArray(recipe?.instructions) && recipe.instructions.map((step: string, idx: number) => (
              <Text key={idx} style={styles.instruction}>{idx + 1}. {step}</Text>
            ))}
          </View>
        </BlurView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurCard: {
    borderRadius: 32,
    overflow: 'hidden',
    margin: 16,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 32,
    padding: 24,
    minWidth: 320,
    maxWidth: 600,
    elevation: 6,
    width: '100%',
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    marginBottom: 18,
    color: '#6C47FF',
    textAlign: 'center',
  },
  section: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    marginTop: 18,
    marginBottom: 8,
    color: '#222',
  },
  ingredient: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    marginLeft: 16,
    marginBottom: 4,
    color: '#333',
  },
  instruction: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    marginLeft: 16,
    marginBottom: 10,
    color: '#333',
  },
});

export default RecipeView; 