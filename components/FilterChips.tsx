import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontFamilies from '../FontFamilies';
import Spacing from '../Spacing';
import AppColors from '../AppColors';

const FilterChips = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Filter Chips Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.defaultBorderRadius,
    borderWidth: 1,
    borderColor: AppColors.borderColor,
    margin: Spacing.sm,
  },
  text: {
    fontFamily: FontFamilies.monospace,
    fontSize: 16,
    color: '#222',
  },
});

export default FilterChips; 