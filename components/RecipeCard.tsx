import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontFamilies from '../FontFamilies';
import Spacing from '../Spacing';
import AppColors from '../AppColors';

const RecipeCard = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>Recipe Card Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.defaultBorderRadius * 1.5,
    borderWidth: 1,
    borderColor: AppColors.borderColor,
    padding: Spacing.lg,
    margin: Spacing.md,
    alignItems: 'center',
    shadowColor: AppColors.shadowColor,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: {
    fontFamily: FontFamilies.monospace,
    fontSize: 18,
    color: '#222',
  },
});

export default RecipeCard; 