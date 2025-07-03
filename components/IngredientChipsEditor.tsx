import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Chip, Button, Text, useTheme } from 'react-native-paper';

interface Props {
  initialIngredients: string[];
  onChange: (ingredients: string[]) => void;
}

const IngredientChipsEditor: React.FC<Props> = ({ initialIngredients, onChange }) => {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState<string[]>(initialIngredients);
  const [initialized, setInitialized] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!initialized) {
      setIngredients(initialIngredients);
      setSelected(initialIngredients);
      setInitialized(true);
    }
  }, [initialIngredients, initialized]);

  const handleToggle = (item: string) => {
    let updated: string[];
    if (selected.includes(item)) {
      updated = selected.filter(i => i !== item);
    } else {
      updated = [...selected, item];
    }
    setSelected(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      const updated = [...ingredients, trimmed];
      setIngredients(updated);
      setInput('');
      setSelected(prev => [...prev, trimmed]);
      onChange([...selected, trimmed]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Detected Ingredients</Text>
      <View style={styles.chipRow}>
        {ingredients.map((item, idx) => {
          const isSelected = selected.includes(item);
          return (
            <Chip
              key={item + '-' + idx}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              mode={isSelected ? 'flat' : 'outlined'}
              selected={isSelected}
              onPress={() => handleToggle(item)}
              textStyle={isSelected ? { color: theme.colors.onPrimary } : { color: theme.colors.onSurface }}
            >
              {item}
            </Chip>
          );
        })}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Add ingredient"
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAdd} style={styles.addButton} disabled={!input.trim()}>
          Add
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    fontFamily: 'AnonymousPro_400Regular',
    fontSize: 15,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    maxWidth: '90%',
    flexShrink: 1,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 40,
    fontFamily: 'AnonymousPro_400Regular',
  },
  addButton: {
    borderRadius: 12,
  },
});

export default IngredientChipsEditor; 