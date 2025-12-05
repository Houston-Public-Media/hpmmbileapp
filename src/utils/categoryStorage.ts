import AsyncStorage from '@react-native-async-storage/async-storage';


const CATEGORIES_KEY = '@news_categories';

export interface Category {
  id: string;
  name: string;
  selected: boolean;
}

export const defaultCategories: Category[] = [
  // { id: '2', name: 'All News', selected: true },
  { id: '2113', name: 'Local News', selected: false },
  { id: '32566', name: 'City of Houston', selected: true },
  { id: '51718', name: 'Courts', selected: false },
  { id: '10', name: 'Education', selected: false },
  { id: '3', name: 'Arts & Culture', selected: false },
  { id: '14', name: 'Energy & Environment', selected: false },
  { id: '58671', name: 'Fort Bend', selected: false },
  { id: '32567', name: 'Harris County', selected: false },
  { id: '16', name: 'Health & Science', selected: false },
  { id: '51851', name: 'Housing', selected: false },
  { id: '29328', name: 'inDepth', selected: false },
  { id: '52248', name: 'Infrastructure', selected: false },
  { id: '20', name: 'Politics', selected: false },
  { id: '3340', name: 'Sports', selected: false },
  { id: '22', name: 'Texas', selected: true },
  { id: '18', name: 'Transportation', selected: false },
  { id: '2232', name: 'Weather', selected: false },
];

export const getCategories = async (): Promise<Category[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultCategories;
  } catch (e) {
    //console.error('Error getting categories:', e);
    return defaultCategories;
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(categories);
    await AsyncStorage.setItem(CATEGORIES_KEY, jsonValue);
  } catch (e) {
    //console.error('Error saving categories:', e);
  }
};

export const toggleCategory = async (id: string): Promise<Category[]> => {
  const categories = await getCategories();
  const updatedCategories = categories.map(cat => {
    if (cat.id === id) {
      return { ...cat, selected: !cat.selected };
    }
    return cat;
  });
  await saveCategories(updatedCategories);
  return updatedCategories;
};

export const getSelectedCategories = async (): Promise<Category[]> => {
  const categories = await getCategories();
  return categories.filter(cat => cat.selected);
};
