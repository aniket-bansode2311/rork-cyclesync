import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Calendar, Settings, Utensils } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { FoodSearch } from '@/components/FoodSearch';
import { FoodEntryModal } from '@/components/FoodEntryModal';
import { NutritionSummary } from '@/components/NutritionSummary';
import { useNutrition } from '@/hooks/useNutrition';
import { FoodItem, MealType } from '@/types/nutrition';
import colors from '@/constants/colors';

const mealTypes: { type: MealType; label: string; icon: React.ReactNode }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: <Utensils size={20} color={colors.primary} /> },
  { type: 'lunch', label: 'Lunch', icon: <Utensils size={20} color={colors.primary} /> },
  { type: 'dinner', label: 'Dinner', icon: <Utensils size={20} color={colors.primary} /> },
  { type: 'snack', label: 'Snack', icon: <Utensils size={20} color={colors.primary} /> },
];

export default function NutritionScreen() {
  const router = useRouter();
  const {
    getDailySummary,
    getEntriesForMeal,
    addFoodEntry,
    deleteFoodEntry,
    goals,
    isLoading,
    error,
  } = useNutrition();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showFoodSearch, setShowFoodSearch] = useState<boolean>(false);
  const [showFoodModal, setShowFoodModal] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  const dailySummary = getDailySummary(selectedDate);

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleFoodSelected = (foodItem: FoodItem) => {
    setSelectedFood(foodItem);
    setShowFoodSearch(false);
    setShowFoodModal(true);
  };

  const handleSaveFood = async (
    foodItem: FoodItem,
    quantity: number,
    servings: number,
    mealType: MealType
  ) => {
    try {
      await addFoodEntry(foodItem, quantity, servings, mealType, selectedDate);
      setShowFoodModal(false);
      setSelectedFood(null);
    } catch (err) {
      console.error('Error adding food entry:', err);
      Alert.alert('Error', 'Failed to add food entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFoodEntry(entryId);
            } catch (err) {
              console.error('Error deleting food entry:', err);
              Alert.alert('Error', 'Failed to delete food entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMealSection = (mealType: MealType, label: string) => {
    const entries = getEntriesForMeal(selectedDate, mealType);
    const mealCalories = entries.reduce(
      (total, entry) => total + entry.foodItem.calories * entry.servings,
      0
    );

    return (
      <View key={mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <Utensils size={18} color={colors.primary} />
            <Text style={styles.mealTitle}>{label}</Text>
            <Text style={styles.mealCalories}>{Math.round(mealCalories)} cal</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddFood(mealType)}
            testID={`add-${mealType}-button`}
          >
            <Plus size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {entries.length > 0 ? (
          <View style={styles.entriesList}>
            {entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryItem}
                onLongPress={() => handleDeleteEntry(entry.id)}
                testID={`food-entry-${entry.id}`}
              >
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.foodItem.name}</Text>
                  {entry.foodItem.brand && (
                    <Text style={styles.entryBrand}>{entry.foodItem.brand}</Text>
                  )}
                  <Text style={styles.entryDetails}>
                    {entry.servings} serving{entry.servings !== 1 ? 's' : ''} • {' '}
                    {Math.round(entry.foodItem.calories * entry.servings)} cal
                  </Text>
                </View>
                <View style={styles.entryNutrition}>
                  <Text style={styles.nutritionText}>
                    P: {Math.round(entry.foodItem.protein * entry.servings)}g
                  </Text>
                  <Text style={styles.nutritionText}>
                    C: {Math.round(entry.foodItem.carbs * entry.servings)}g
                  </Text>
                  <Text style={styles.nutritionText}>
                    F: {Math.round(entry.foodItem.fat * entry.servings)}g
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyMeal}>
            <Text style={styles.emptyMealText}>No foods logged for {label.toLowerCase()}</Text>
          </View>
        )}
      </View>
    );
  };

  if (showFoodSearch) {
    return (
      <>
        <Stack.Screen
          options={{
            title: `Add to ${mealTypes.find(m => m.type === selectedMealType)?.label}`,
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.black,
          }}
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.searchContainer}>
            <FoodSearch
              onSelectFood={handleFoodSelected}
              placeholder={`Search foods for ${mealTypes.find(m => m.type === selectedMealType)?.label.toLowerCase()}...`}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowFoodSearch(false)}
              style={styles.cancelButton}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nutrition Tracking',
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.black,
          headerRight: () => (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                // TODO: Navigate to nutrition goals/settings when implemented
                Alert.alert('Coming Soon', 'Nutrition goals settings will be available soon!');
              }}
            >
              <Settings size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.dateSelector}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  // In a real app, you'd show a date picker here
                  const today = new Date().toISOString().split('T')[0];
                  setSelectedDate(today);
                }}
              >
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.dateText}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <NutritionSummary summary={dailySummary} goals={goals} />

            <View style={styles.mealsContainer}>
              <Text style={styles.sectionTitle}>Meals</Text>
              {mealTypes.map(({ type, label }) => renderMealSection(type, label))}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <FoodEntryModal
        visible={showFoodModal}
        foodItem={selectedFood}
        mealType={selectedMealType}
        onClose={() => {
          setShowFoodModal(false);
          setSelectedFood(null);
        }}
        onSave={handleSaveFood}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  searchContainer: {
    flex: 1,
    padding: 20,
  },
  cancelButton: {
    marginTop: 16,
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
  },
  mealsContainer: {
    gap: 16,
  },
  mealSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  mealCalories: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entriesList: {
    gap: 8,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  entryBrand: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  entryDetails: {
    fontSize: 12,
    color: colors.gray[500],
  },
  entryNutrition: {
    alignItems: 'flex-end',
    gap: 2,
  },
  nutritionText: {
    fontSize: 10,
    color: colors.gray[600],
    fontWeight: '500',
  },
  emptyMeal: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
});