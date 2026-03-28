import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { FoodSearchResult, FoodItem } from '@/types/nutrition';
import { NutritionService } from '@/utils/nutritionService';
import colors from '@/constants/colors';

interface FoodSearchProps {
  onSelectFood: (foodItem: FoodItem) => void;
  placeholder?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  onSelectFood,
  placeholder = 'Search for foods...',
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        searchFoods(query.trim());
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchFoods = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchResults = await NutritionService.searchFoods(searchQuery, 20);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching foods:', err);
      setError('Failed to search foods. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = (result: FoodSearchResult) => {
    try {
      const foodItem = NutritionService.convertSearchResultToFoodItem(result);
      onSelectFood(foodItem);
    } catch (err) {
      console.error('Error converting food result:', err);
      Alert.alert('Error', 'Failed to select food item. Please try again.');
    }
  };

  const renderFoodItem = ({ item }: { item: FoodSearchResult }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleSelectFood(item)}
      testID={`food-item-${item.fdcId}`}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.description}
        </Text>
        {item.brandOwner && (
          <Text style={styles.brandName} numberOfLines={1}>
            {item.brandOwner}
          </Text>
        )}
        <View style={styles.nutritionPreview}>
          {item.foodNutrients && (
            <Text style={styles.nutritionText}>
              {Math.round(item.foodNutrients.find(n => n.nutrientName.includes('Energy'))?.value || 0)} cal
            </Text>
          )}
        </View>
      </View>
      <View style={styles.addButton}>
        <Plus size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Searching foods...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (query.trim().length <= 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Type at least 3 characters to search for foods
          </Text>
        </View>
      );
    }

    if (results.length === 0 && query.trim().length > 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No foods found for &quot;{query}&quot;
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.gray[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[500]}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          testID="food-search-input"
        />
      </View>

      <FlatList
        data={results}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.fdcId.toString()}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        testID="food-search-results"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  resultsList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  nutritionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});