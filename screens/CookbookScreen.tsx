import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import FontFamilies from '../FontFamilies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY = 'SAVED_RECIPES';

type SavedRecipe = {
  id: string;
  title: string;
  text: string;
};

const CookbookScreen = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchRecipes = async () => {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        setRecipes(data ? JSON.parse(data) : []);
      };
      fetchRecipes();
    }, [])
  );

  const renderItem = ({ item }: { item: SavedRecipe }) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(item.text);
    } catch {}
    return (
      <View style={styles.recipeCard}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
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
        <Appbar.Content title="Cookbook" titleStyle={{ fontFamily: FontFamilies.lexendBold, fontSize: 22, letterSpacing: 0.5 }} />
      </Appbar.Header>
      <FlatList
        data={recipes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.text}>No recipes in your cookbook yet.</Text>}
      />
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
    fontFamily: FontFamilies.lexendBold,
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
});

export default CookbookScreen; 