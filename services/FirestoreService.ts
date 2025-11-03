// FirestoreService.ts
// Complete implementation for interacting with Google Cloud Firestore

import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

export interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cuisine?: string;
  dietary?: string[];
  servings?: number;
  rating?: number;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SavedRecipe {
  id: string;
  title: string;
  text: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function saveRecipe(recipe: Recipe, userId: string): Promise<string> {
  try {
    const recipeData = {
      ...recipe,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(firestore, 'recipes'), recipeData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

export async function saveSavedRecipe(savedRecipe: Omit<SavedRecipe, 'id'>, userId: string): Promise<string> {
  try {
    const recipeData = {
      ...savedRecipe,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(firestore, 'savedRecipes'), recipeData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

export async function updateRecipe(recipeId: string, updates: Partial<Recipe>, userId: string): Promise<void> {
  try {
    const recipeRef = doc(firestore, 'recipes', recipeId);

    // Verify user owns this recipe
    const recipeDoc = await getDoc(recipeRef);
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }

    const recipeData = recipeDoc.data();
    if (recipeData.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own recipes');
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(recipeRef, updateData);
  } catch (error: any) {
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
  try {
    const recipeRef = doc(firestore, 'recipes', recipeId);

    // Verify user owns this recipe
    const recipeDoc = await getDoc(recipeRef);
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }

    const recipeData = recipeDoc.data();
    if (recipeData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own recipes');
    }

    await deleteDoc(recipeRef);
  } catch (error: any) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}

export async function deleteSavedRecipe(recipeId: string, userId: string): Promise<void> {
  try {
    const recipeRef = doc(firestore, 'savedRecipes', recipeId);

    // Verify user owns this recipe
    const recipeDoc = await getDoc(recipeRef);
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }

    const recipeData = recipeDoc.data();
    if (recipeData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own recipes');
    }

    await deleteDoc(recipeRef);
  } catch (error: any) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    const recipesQuery = query(
      collection(firestore, 'recipes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(recipesQuery);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Recipe);
    });

    return recipes;
  } catch (error: any) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
}

export async function getUserSavedRecipes(userId: string): Promise<SavedRecipe[]> {
  try {
    const recipesQuery = query(
      collection(firestore, 'savedRecipes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(recipesQuery);
    const recipes: SavedRecipe[] = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as SavedRecipe);
    });

    return recipes;
  } catch (error: any) {
    throw new Error(`Failed to fetch saved recipes: ${error.message}`);
  }
}

export function listenToUserRecipes(userId: string, onUpdate: (recipes: Recipe[]) => void): () => void {
  const recipesQuery = query(
    collection(firestore, 'recipes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(recipesQuery, (querySnapshot) => {
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Recipe);
    });

    onUpdate(recipes);
  }, (error) => {
    console.error('Error listening to recipes:', error);
  });

  return unsubscribe;
}

export function listenToUserSavedRecipes(userId: string, onUpdate: (recipes: SavedRecipe[]) => void): () => void {
  const recipesQuery = query(
    collection(firestore, 'savedRecipes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(recipesQuery, (querySnapshot) => {
    const recipes: SavedRecipe[] = [];

    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as SavedRecipe);
    });

    onUpdate(recipes);
  }, (error) => {
    console.error('Error listening to saved recipes:', error);
  });

  return unsubscribe;
}

// Legacy function for backward compatibility
export function listenToRecipes(onUpdate: (recipes: any[]) => void): () => void {
  console.warn('listenToRecipes called without userId. Use listenToUserRecipes instead.');
  onUpdate([]);
  return () => {};
} 