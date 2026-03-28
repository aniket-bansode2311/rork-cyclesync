import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import { FoodItem, MealType } from '@/types/nutrition';
import { Button } from '@/components/Button';
import colors from '@/constants/colors';

interface FoodEntryModalProps {
  visible: boolean;
  foodItem: FoodItem | null;
  mealType: MealType;
  onClose: () => void;
  onSave: (foodItem: FoodItem, quantity: number, servings: number, mealType: MealType) => void;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  visible,
  foodItem,
  mealType,
  onClose,
  onSave,
}) => {
  const [servings, setServings] = useState<number>(1);
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [isCustomQuantity, setIsCustomQuantity] = useState<boolean>(false);

  const handleClose = () => {
    setServings(1);
    setCustomQuantity('');
    setIsCustomQuantity(false);
    onClose();
  };

  const handleSave = () => {
    if (!foodItem) return;

    const quantity = isCustomQuantity ? parseFloat(customQuantity) || 1 : 1;
    const finalServings = isCustomQuantity ? quantity : servings;

    if (finalServings <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0.');
      return;
    }

    onSave(foodItem, quantity, finalServings, mealType);
    handleClose();
  };

  const adjustServings = (delta: number) => {
    const newServings = Math.max(0.25, servings + delta);
    setServings(Math.round(newServings * 4) / 4); // Round to nearest 0.25
  };

  const calculateNutrition = () => {
    if (!foodItem) return null;

    const multiplier = isCustomQuantity ? parseFloat(customQuantity) || 1 : servings;
    
    return {
      calories: Math.round(foodItem.calories * multiplier),
      protein: Math.round(foodItem.protein * multiplier * 10) / 10,
      carbs: Math.round(foodItem.carbs * multiplier * 10) / 10,
      fat: Math.round(foodItem.fat * multiplier * 10) / 10,
    };
  };

  const nutrition = calculateNutrition();

  if (!foodItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add to {mealTypeLabels[mealType]}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{foodItem.name}</Text>
            {foodItem.brand && (
              <Text style={styles.brandName}>{foodItem.brand}</Text>
            )}
            <Text style={styles.servingInfo}>
              Per {foodItem.servingSize} {foodItem.servingUnit}
            </Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            
            <View style={styles.quantityToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isCustomQuantity && styles.toggleButtonActive,
                ]}
                onPress={() => setIsCustomQuantity(false)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    !isCustomQuantity && styles.toggleButtonTextActive,
                  ]}
                >
                  Servings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isCustomQuantity && styles.toggleButtonActive,
                ]}
                onPress={() => setIsCustomQuantity(true)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    isCustomQuantity && styles.toggleButtonTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {!isCustomQuantity ? (
              <View style={styles.servingsControl}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustServings(-0.25)}
                >
                  <Minus size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.servingsText}>{servings}</Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => adjustServings(0.25)}
                >
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={styles.customInput}
                placeholder="Enter quantity"
                value={customQuantity}
                onChangeText={setCustomQuantity}
                keyboardType="numeric"
                placeholderTextColor={colors.gray[500]}
              />
            )}
          </View>

          {nutrition && (
            <View style={styles.nutritionPreview}>
              <Text style={styles.sectionTitle}>Nutrition Preview</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            style={styles.cancelButton}
          />
          <Button
            title="Add Food"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  foodInfo: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  servingInfo: {
    fontSize: 14,
    color: colors.gray[500],
  },
  quantitySection: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  quantityToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  toggleButtonTextActive: {
    color: colors.primary,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    minWidth: 60,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
  },
  nutritionPreview: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});