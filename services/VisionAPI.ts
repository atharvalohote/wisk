import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const GOOGLE_VISION_API_KEY = Constants.expoConfig?.extra?.GOOGLE_VISION_API_KEY;

if (!GOOGLE_VISION_API_KEY) {
  throw new Error('GOOGLE_VISION_API_KEY is not configured. Please add it to app.json under "extra".');
}

// Food/ingredient keywords for filtering
  const FOOD_KEYWORDS = [
    // Fruits
    'apple', 'banana', 'orange', 'grape', 'berry', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cherry', 'pear', 'plum', 'peach', 'apricot', 'fig', 'date', 'kiwi', 'mango', 'papaya', 'pineapple', 'melon', 'watermelon', 'cantaloupe', 'honeydew', 'pomegranate', 'guava', 'lychee', 'passion fruit', 'dragon fruit', 'jackfruit', 'avocado',
    // Vegetables
    'potato', 'tomato', 'onion', 'garlic', 'carrot', 'pepper', 'lettuce', 'cabbage', 'broccoli', 'spinach', 'corn', 'pea', 'mushroom', 'cucumber', 'zucchini', 'eggplant', 'pumpkin', 'squash', 'okra', 'artichoke', 'asparagus', 'beet', 'brussels sprout', 'cauliflower', 'celery', 'chard', 'collard', 'daikon', 'edamame', 'endive', 'fennel', 'jicama', 'kale', 'leek', 'parsnip', 'radish', 'rutabaga', 'shallot', 'turnip', 'yam', 'sweet potato', 'watercress', 'arugula', 'bok choy', 'chicory', 'dandelion', 'escarole', 'frisee', 'kohlrabi', 'mustard greens', 'rapini', 'salsify', 'scallion', 'taro', 'wasabi',
    // Grains & Starches
    'rice', 'bread', 'pasta', 'noodle', 'spaghetti', 'macaroni', 'oat', 'barley', 'wheat', 'cornmeal', 'couscous', 'quinoa', 'bulgur', 'polenta', 'tortilla', 'cracker', 'bagel', 'bun', 'roll', 'biscuit', 'croissant', 'muffin', 'pancake', 'waffle', 'cereal',
    // Dairy
    'milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream', 'ghee', 'paneer', 'curd',
    // Meats & Protein
    'meat', 'beef', 'pork', 'lamb', 'goat', 'veal', 'bacon', 'ham', 'sausage', 'salami', 'turkey', 'duck', 'goose', 'chicken', 'egg', 'fish', 'seafood', 'shrimp', 'crab', 'lobster', 'shellfish', 'octopus', 'squid', 'anchovy', 'sardine', 'mackerel', 'tuna', 'salmon', 'trout', 'cod', 'herring', 'snapper', 'tilapia', 'catfish',
    // Beans, Nuts, Seeds
    'bean', 'lentil', 'chickpea', 'soy', 'tofu', 'tempeh', 'almond', 'cashew', 'peanut', 'walnut', 'pecan', 'hazelnut', 'macadamia', 'pistachio', 'brazil nut', 'sunflower seed', 'pumpkin seed', 'chia', 'flax', 'sesame',
    // Oils, Fats
    'oil', 'olive oil', 'canola oil', 'vegetable oil', 'coconut oil', 'sesame oil', 'ghee', 'margarine', 'shortening',
    // Spices, Herbs, Condiments
    'spice', 'herb', 'basil', 'cilantro', 'parsley', 'mint', 'rosemary', 'thyme', 'sage', 'dill', 'coriander', 'cumin', 'turmeric', 'ginger', 'cinnamon', 'clove', 'nutmeg', 'vanilla', 'mustard', 'ketchup', 'mayonnaise', 'vinegar', 'soy sauce', 'sauce', 'hot sauce', 'barbecue sauce', 'jam', 'jelly', 'honey', 'maple syrup', 'molasses', 'chutney', 'pesto', 'salsa', 'relish',
    // Sweeteners
    'sugar', 'brown sugar', 'cane sugar', 'powdered sugar', 'corn syrup', 'agave', 'stevia',
    // Baking & Processed Foods
    'flour', 'yeast', 'baking powder', 'baking soda', 'cornstarch', 'cookie', 'cake', 'pie', 'brownie', 'doughnut', 'pastry', 'croissant', 'cracker', 'biscuit', 'muffin', 'pancake', 'waffle', 'cereal', 'granola', 'bar', 'candy', 'chocolate', 'marshmallow',
    // Misc (only specific edible items)
    'salt', 'pepper', 'broth', 'stock', 'bouillon', 'gelatin', 'seitan', 'pickles', 'kimchi', 'sauerkraut', 'miso', 'tahini', 'guacamole', 'hummus', 'falafel', 'samosa', 'spring roll', 'dumpling', 'sushi', 'pizza', 'burger', 'sandwich', 'wrap', 'taco', 'burrito', 'quesadilla', 'enchilada', 'lasagna', 'curry', 'stew', 'soup', 'chowder', 'goulash', 'risotto', 'paella', 'jambalaya', 'casserole', 'gratin', 'ratatouille', 'frittata', 'omelette', 'quiche', 'crepe', 'fondue', 'kabob', 'skewer', 'satay', 'meatball', 'meatloaf', 'patty', 'cutlet', 'nugget', 'strip', 'wing', 'drumstick', 'rib', 'shank', 'loin', 'chop', 'steak', 'roast', 'brisket', 'tenderloin', 'filet', 'fillet', 'medallion', 'roll', 'roulade', 'terrine', 'pate', 'mousse', 'souffle', 'custard', 'pudding', 'trifle', 'tart', 'galette', 'clafoutis', 'crumble', 'cobbler', 'compote', 'sorbet', 'gelato', 'parfait', 'milkshake', 'smoothie', 'frappe', 'slush', 'popsicle', 'ice pop', 'granita', 'sherbet', 'frozen yogurt', 'energy bar', 'protein bar', 'trail mix', 'juice', 'soda', 'tea', 'coffee', 'espresso', 'latte', 'cappuccino', 'mocha', 'chai', 'matcha', 'kombucha', 'wine', 'beer', 'ale', 'lager', 'stout', 'porter', 'cider', 'mead', 'cocktail', 'mocktail', 'liquor', 'spirit', 'vodka', 'gin', 'rum', 'tequila', 'whiskey', 'brandy', 'cognac', 'armagnac', 'schnapps', 'liqueur', 'vermouth', 'bitters', 'aperitif', 'digestif', 'sherry', 'port', 'sake', 'soju', 'baijiu', 'arak', 'ouzo', 'raki', 'grappa', 'calvados', 'absinthe'
  ];

function isFoodTerm(term: string): boolean {
  // Only match if the term is an exact match (case-insensitive) to a food keyword
  return FOOD_KEYWORDS.some(keyword => term.trim().toLowerCase() === keyword);
}

export async function detectIngredientsFromImage(imageUri: string): Promise<string[]> {
  try {
    // Removed input imageUri log
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

    const body = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'TEXT_DETECTION', maxResults: 1 }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const result = await response.json();
    // Removed all Vision API logging
    const detected = new Set<string>();

    // 1. OBJECT_LOCALIZATION
    const objects = result.responses?.[0]?.localizedObjectAnnotations || [];
    for (const obj of objects) {
      if (obj.name && isFoodTerm(obj.name)) {
        detected.add(obj.name.charAt(0).toUpperCase() + obj.name.slice(1));
      }
    }

    // 2. LABEL_DETECTION
    const labels = result.responses?.[0]?.labelAnnotations || [];
    for (const label of labels) {
      if (label.description && isFoodTerm(label.description)) {
        detected.add(label.description.charAt(0).toUpperCase() + label.description.slice(1));
      }
    }

    // 3. TEXT_DETECTION (OCR)
    const textAnnotations = result.responses?.[0]?.textAnnotations || [];
    if (textAnnotations.length > 0) {
      const fullText = textAnnotations[0].description;
      for (const foodTerm of FOOD_KEYWORDS) {
        const regex = new RegExp(`\\b${foodTerm}\\b`, 'i');
        if (regex.test(fullText)) {
          detected.add(foodTerm.charAt(0).toUpperCase() + foodTerm.slice(1));
        }
      }
    }

    const detectedArray = Array.from(detected);
    // Removed detected ingredients output log
    return detectedArray;
  } catch (error) {
    // Removed Vision API error log
    return [];
  }
} 