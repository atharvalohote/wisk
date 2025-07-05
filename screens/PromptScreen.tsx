import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, useWindowDimensions, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Appbar, Card, Button, TextInput, Text, useTheme, Chip, Portal, Dialog, IconButton, FAB } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import ImageCarousel from '../components/ImageCarousel';
import { generateRecipe } from '../services/GeminiAPI';
import Markdown from 'react-native-markdown-display';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import IngredientChipsEditor from '../components/IngredientChipsEditor';
import CameraCapture from '../components/CameraCapture';
import { detectIngredientsFromImage } from '../services/VisionAPI';
import * as FileSystem from 'expo-file-system';
import ProcessingAnimation from '../components/ProcessingAnimation';
import FontFamilies from '../FontFamilies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { SafeAreaView } from 'react-native-safe-area-context';

const STAPLE_INGREDIENTS = ['Oil', 'Flour', 'Salt', 'Butter', 'Sugar'];
const CUISINES = ['Italian', 'Mexican', 'Japanese', 'Indian', 'French'];
const DIETARY = ['Vegan', 'Gluten-Free', 'Nut-Free', 'Dairy-Free', 'Vegetarian'];
const STORAGE_KEY = 'SAVED_RECIPES';

const STAPLE_COLORS: { [key: string]: { background: string; text: string } } = {
  Oil: { background: '#FFF5B7', text: '#7A6A01' },      // Light yellow
  Flour: { background: '#E0C3A3', text: '#6B4F1D' },    // Wheat beige
  Salt: { background: '#D6EFFF', text: '#1A3A5A' },     // Pale blue
  Butter: { background: '#FFE6A7', text: '#7A5A01' },   // Butter yellow
  Sugar: { background: '#FFD6E0', text: '#7A1A3A' },    // Pink sugar
};
const DIETARY_COLORS: { [key: string]: { background: string; text: string } } = {
  Vegan: { background: '#B5EAD7', text: '#1A4D3A' },         // Mint green
  'Gluten-Free': { background: '#F7D6E0', text: '#7A1A3A' }, // Light pink
  'Nut-Free': { background: '#FFF5B7', text: '#7A6A01' },    // Light yellow
  'Dairy-Free': { background: '#A7E4F7', text: '#00334A' },  // Sky blue
  Vegetarian: { background: '#FFB6B9', text: '#7A1A1A' },    // Soft pink
};

const CUISINE_COLORS: { [key: string]: { background: string; text: string } } = {
  Italian: { background: '#FFD36E', text: '#7A4F01' },    // Sunny yellow
  Mexican: { background: '#FF8C70', text: '#7A2E00' },    // Coral orange
  Japanese: { background: '#A7E4F7', text: '#00334A' },   // Sky blue
  Indian: { background: '#FFB6B9', text: '#7A1A1A' },     // Soft pink
  French: { background: '#B5EAD7', text: '#1A4D3A' },     // Mint green
};

function buildPrompt(staples: string[], cuisines: string[], dietary: string[], context: string): string {
    // Example 1: Vegan Pasta
    const exampleInput1 = JSON.stringify({
        cuisine: "Italian",
        dietary_restrictions: ["Vegan"],
        key_ingredients: ["Tomato", "Basil", "Pasta"],
        additional_context: "Quick"
    });
    const exampleOutput1 = `{
  "title": "Vegan Pasta",
  "ingredients": [
    "200g pasta",
    "2 tomatoes",
    "Fresh basil",
    "Olive oil"
  ],
  "instructions": [
    "Boil pasta until tender.",
    "Chop tomatoes and cook with olive oil to make a sauce.",
    "Mix pasta with sauce and top with fresh basil."
  ]
}`;
    // Example 2: Chicken Rice
    const exampleInput2 = JSON.stringify({
        cuisine: "Asian",
        dietary_restrictions: [],
        key_ingredients: ["Chicken", "Rice", "Broccoli"],
        additional_context: "Simple"
    });
    const exampleOutput2 = `{
  "title": "Chicken Rice",
  "ingredients": [
    "1 cup rice",
    "1 chicken breast",
    "1 cup broccoli",
    "Soy sauce"
  ],
  "instructions": [
    "Cook rice according to package instructions.",
    "Cut chicken and broccoli into pieces and stir-fry until cooked.",
    "Mix with rice and soy sauce, then serve."
  ]
}`;
    const userInputParams = {
        cuisine: cuisines.length ? cuisines.join(',') : 'any',
        dietary_restrictions: dietary.length ? dietary : [],
        key_ingredients: staples.length ? staples : [],
        additional_context: context || 'none'
    };
    const userInputJsonString = JSON.stringify(userInputParams);
    return `You are an expert recipe generator. Given the following input parameters, return a recipe as a JSON object with these keys: title (short string), ingredients (array of strings), instructions (array of short, clear, and explanatory steps). Each instruction should explain what to do in simple language, but avoid unnecessary length.\n\nExample:\nInput Parameters: ${exampleInput1}\nOutput JSON:\n${exampleOutput1}\n---\nInput Parameters: ${exampleInput2}\nOutput JSON:\n${exampleOutput2}\n---\nInput Parameters: ${userInputJsonString}\nOutput JSON:`;
}

const PromptScreen = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedStaples, setSelectedStaples] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputWarning, setInputWarning] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const [selectedDetectedIngredients, setSelectedDetectedIngredients] = useState<string[]>([]);
  const [showChipsEditor, setShowChipsEditor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dotCount, setDotCount] = useState(0);
  const [plainTextOutput, setPlainTextOutput] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<{ title: string; ingredients: string[]; instructions: string[] } | null>(null);
  const [cancelRequested, setCancelRequested] = useState(false);
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDotCount(0);
    }
  }, [loading]);

  const handleChipToggle = (item: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
    Haptics.selectionAsync();
  };

  const handleReset = () => {
    setImages([]);
    setSelectedStaples([]);
    setSelectedCuisines([]);
    setSelectedDietary([]);
    setContext('');
    Haptics.selectionAsync();
  };

  const isInputEmpty =
    selectedStaples.length === 0 &&
    selectedCuisines.length === 0 &&
    selectedDietary.length === 0 &&
    !context.trim() &&
    images.length === 0;

  const handleImageChange = (imgs: string[]) => {
    setImages(imgs);
    if (imgs.length > 0) {
      setShowChipsEditor(true);
    } else {
      setDetectedIngredients([]);
      setShowChipsEditor(false);
    }
  };

  const handleCameraImage = async (base64: string) => {
    setShowCamera(false);
    setVisionLoading(true);
    try {
      const uniqueId = Date.now();
      const fileUri = `${FileSystem.cacheDirectory}camera_capture_${uniqueId}.jpg`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      setCapturedImage(fileUri);
      const { ingredients, labels } = await detectIngredientsFromImage(fileUri);
      setDetectedIngredients(ingredients);
      setDetectedLabels(labels);
      setShowChipsEditor(true);
      setVisionLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setVisionLoading(false);
      alert('Failed to detect ingredients from image.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const promptText = buildPrompt(
    selectedDetectedIngredients.length > 0 ? selectedDetectedIngredients : selectedStaples,
    selectedCuisines,
    selectedDietary,
    context
  );

  const handleGenerateRecipe = async () => {
    setCancelRequested(false);
    if (
      selectedDetectedIngredients.length === 0 &&
      selectedStaples.length === 0 &&
      selectedCuisines.length === 0 &&
      selectedDietary.length === 0 &&
      !context.trim() &&
      !capturedImage
    ) {
      setInputWarning(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setLoading(true);
    setPlainTextOutput(null);
    setParsedRecipe(null);
    try {
      // Call Gemini API and get the result
      const result = await generateRecipe(promptText);
      if (cancelRequested) {
        setLoading(false);
        return;
      }
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // --- Gemini Output Extraction as JSON ---
      let recipeText: string | null = null;
      if (result && Array.isArray(result.candidates) && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        if (candidate.content && Array.isArray(candidate.content.parts)) {
          recipeText = candidate.content.parts.map((p: any) => p.text).filter(Boolean).join('\n');
        }
      }
      // Clean code block markers and 'Output JSON:' prefix
      let cleaned = recipeText ? recipeText.trim() : '';
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      if (cleaned.startsWith('Output JSON:')) {
        cleaned = cleaned.replace(/^Output JSON:/, '').trim();
      }
      // Try to parse as JSON and navigate to RecipeTextScreen
      try {
        const recipeJson = JSON.parse(cleaned);
        navigation.navigate('RecipeTextScreen', { recipe: recipeJson });
      } catch (e) {
        setParsedRecipe(null);
        setPlainTextOutput(cleaned || 'No output received.');
      }
    } catch (err: any) {
      if (cancelRequested) {
        setLoading(false);
        return;
      }
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setParsedRecipe(null);
      setPlainTextOutput('Failed to generate recipe.');
    }
  };

  const handleSaveRecipe = async () => {
    if (!parsedRecipe) return;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const recipes = data ? JSON.parse(data) : [];
      const newRecipe = { id: uuidv4(), title: parsedRecipe.title, text: JSON.stringify(parsedRecipe, null, 2) };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newRecipe, ...recipes]));
      alert('Recipe saved!');
    } catch (e) {
      alert('Failed to save recipe.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <View style={[styles.container, { backgroundColor: 'transparent', flex: 1 }] }>
        {/* Processing Animation Overlay */}
        {loading && (
          <BlurView
            style={{
              position: 'absolute',
              left: 0, right: 0, top: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
            }}
            intensity={40}
            tint={theme.dark ? 'dark' : 'light'}
            pointerEvents="auto"
          >
            <View pointerEvents="none">
              <ProcessingAnimation />
            </View>
            <View style={{
              marginTop: 32,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 120,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.85)',
              paddingHorizontal: 18,
              paddingVertical: 6,
              alignSelf: 'center',
            }}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#6C47FF',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontFamily: FontFamilies.rubikBubbles,
                  letterSpacing: 1.5,
                  minWidth: 90,
                }}
              >
                {`Cooking${'.'.repeat(dotCount).padEnd(3, ' ')}`}
              </Text>
              <Button
                mode="text"
                onPress={() => {
                  setCancelRequested(true);
                  setLoading(false);
                }}
                style={{ marginTop: 12 }}
                labelStyle={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}
              >
                Cancel
              </Button>
            </View>
          </BlurView>
        )}
      <Appbar.Header elevated>
        <Appbar.Content title="Create Recipe" titleStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26, letterSpacing: 0.5 }} />
      </Appbar.Header>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[styles.outerScrollContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
        <View style={styles.centered}>
          <BlurView style={[styles.blurCard, { width: width - 24, maxWidth: 600, alignSelf: 'center' }]} intensity={24} tint={theme.dark ? 'dark' : 'light'}>
            <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2, width: '100%', alignSelf: 'stretch' }] }>
              <Card.Content>
                {capturedImage ? (
                  <View style={{ width: '100%', alignItems: 'center', marginBottom: 12 }}>
                    <Image source={{ uri: capturedImage }} style={{ width: '100%', height: 220, borderRadius: 18 }} resizeMode="cover" />
                    <Button mode="outlined" onPress={() => {
                      setCapturedImage(null);
                      setShowCamera(true);
                      setDetectedIngredients([]);
                      setSelectedDetectedIngredients([]);
                      setShowChipsEditor(false);
                    }} style={{ marginTop: 8 }}>
                      Retake Photo
                    </Button>
                  </View>
                ) : showCamera ? (
                  <CameraCapture
                    onImageCaptured={(base64, uri) => {
                      setShowCamera(false);
                      setCapturedImage(uri);
                      handleCameraImage(base64);
                    }}
                  />
                ) : (
                  <Button
                    mode="contained"
                    icon="camera"
                    onPress={() => setShowCamera(true)}
                    style={{ marginBottom: 16, borderRadius: 18, height: 76, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 12 }}
                    labelStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, lineHeight: 26, letterSpacing: 0.5, textAlign: 'center', flexGrow: 1, flexShrink: 1 }}
                    contentStyle={{ height: 76, paddingVertical: 8 }}
                    disabled={visionLoading}
                  >
                    Scan Ingredients
                  </Button>
                )}
                {visionLoading && <ActivityIndicator style={{ marginBottom: 12 }} />}
                {showChipsEditor && (
                  <IngredientChipsEditor
                    initialIngredients={detectedIngredients}
                    onChange={setSelectedDetectedIngredients}
                  />
                )}
                <ImageCarousel images={images} onChange={handleImageChange} />
                <Text style={styles.label}>Staple Ingredients</Text>
                <View style={styles.chipRow}>
                  {STAPLE_INGREDIENTS.map(item => {
                    const isSelected = selectedStaples.includes(item);
                    return (
                      <Chip
                        key={item}
                        selected={isSelected}
                        onPress={() => handleChipToggle(item, selectedStaples, setSelectedStaples)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected
                              ? STAPLE_COLORS[item]?.background || '#FFF'
                              : '#F0E5D9',
                          },
                        ]}
                        textStyle={{
                          color: isSelected
                            ? STAPLE_COLORS[item]?.text || '#333'
                            : '#B0A8A0',
                          fontWeight: 'bold',
                        }}
                      >
                        {item}
                      </Chip>
                    );
                  })}
                </View>
                <Text style={styles.label}>Cuisine Preferences</Text>
                <View style={styles.chipRow}>
                  {CUISINES.map(item => {
                    const isSelected = selectedCuisines.includes(item);
                    return (
                      <Chip
                        key={item}
                        selected={isSelected}
                        onPress={() => handleChipToggle(item, selectedCuisines, setSelectedCuisines)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected
                              ? CUISINE_COLORS[item]?.background || '#FFF'
                              : '#F0E5D9', // neutral/disabled background
                          },
                        ]}
                        textStyle={{
                          color: isSelected
                            ? CUISINE_COLORS[item]?.text || '#333'
                            : '#B0A8A0', // muted text when not selected
                          fontWeight: 'bold',
                        }}
                      >
                        {item}
                      </Chip>
                    );
                  })}
                </View>
                <Text style={styles.label}>Dietary Restrictions</Text>
                <View style={styles.chipRow}>
                  {DIETARY.map(item => {
                    const isSelected = selectedDietary.includes(item);
                    return (
                      <Chip
                        key={item}
                        selected={isSelected}
                        onPress={() => handleChipToggle(item, selectedDietary, setSelectedDietary)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected
                              ? DIETARY_COLORS[item]?.background || '#FFF'
                              : '#F0E5D9',
                          },
                        ]}
                        textStyle={{
                          color: isSelected
                            ? DIETARY_COLORS[item]?.text || '#333'
                            : '#B0A8A0',
                          fontWeight: 'bold',
                        }}
                      >
                        {item}
                      </Chip>
                    );
                  })}
                </View>
                <Text style={styles.label}>Additional Context</Text>
                <TextInput
                  label="Add extra details or instructions..."
                  value={context}
                  onChangeText={setContext}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={{ marginBottom: 16, fontFamily: 'AnonymousPro_400Regular' }}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 200);
                      }}
                />
                    <Button
                      mode="contained"
                      buttonColor="#EC4899"
                      icon="magic-staff"
                      onPress={() => {
                        Keyboard.dismiss();
                        handleGenerateRecipe();
                      }}
                      style={[styles.button, { height: 76, width: '100%', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 12, paddingHorizontal: 12 }]}
                      labelStyle={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, lineHeight: 26, letterSpacing: 0.5, textAlign: 'center', flexGrow: 1, flexShrink: 1 }}
                      contentStyle={{ height: 76, paddingVertical: 8 }}
                      disabled={loading || isInputEmpty}
                    >
                      {loading ? null : 'Generate Recipe'}
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </View>
      </ScrollView>
        </View>
        {(parsedRecipe || plainTextOutput) && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
            {parsedRecipe ? (
              <>
                <View style={{ backgroundColor: theme.colors.elevation.level2, borderRadius: 12, padding: 16 }}>
                  <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 26, marginBottom: 12, color: theme.colors.primary }}>{parsedRecipe.title}</Text>
                  <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 8, marginBottom: 4 }}>Ingredients:</Text>
                  {parsedRecipe.ingredients.map((ing: string, idx: number) => (
                    <Text key={idx} style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 16, marginLeft: 8, marginBottom: 2 }}>• {ing}</Text>
                  ))}
                  <Text style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 20, marginTop: 14, marginBottom: 4 }}>Instructions:</Text>
                  {parsedRecipe.instructions.map((step: string, idx: number) => (
                    <Text key={idx} style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 16, marginLeft: 8, marginBottom: 2 }}>{idx + 1}. {step}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                  <Button mode="contained" style={{ flex: 1, borderRadius: 12, marginRight: 8 }} onPress={handleSaveRecipe}>
                    Save Recipe
                  </Button>
                  <Button mode="outlined" style={{ flex: 1, borderRadius: 12, marginLeft: 8 }} onPress={handleGenerateRecipe}>
                    Regenerate Recipe
                  </Button>
                </View>
              </>
            ) : (
              <View style={{ backgroundColor: theme.colors.elevation.level2, borderRadius: 12, padding: 16 }}>
                <Text selectable style={{ fontFamily: FontFamilies.rubikBubbles, fontSize: 16, color: theme.colors.onSurface }}>
                  {plainTextOutput}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
    </View>
    <FAB
      style={{ position: 'absolute', right: 24, bottom: 32, backgroundColor: theme.colors.primary }}
      icon="refresh"
      label="Reload"
      onPress={handleReset}
      color={theme.colors.onPrimary}
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  outerScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
  centered: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },
  blurCard: {
    borderRadius: 28,
    overflow: 'hidden',
    margin: 0,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 64,
    flexGrow: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  card: {
    borderRadius: 28,
    minWidth: 320,
    maxWidth: 600,
    elevation: 0,
    shadowColor: 'transparent',
    width: '100%',
    alignSelf: 'stretch',
    flex: 1,
    margin: 0,
    padding: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'AnonymousPro_400Regular',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 4,
  },
});

export default PromptScreen; 