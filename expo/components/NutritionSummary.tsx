import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionSummary as NutritionSummaryType, NutritionGoals } from '@/types/nutrition';
import colors from '@/constants/colors';

interface NutritionSummaryProps {
  summary: NutritionSummaryType;
  goals: NutritionGoals;
}

interface ProgressBarProps {
  current: number;
  goal: number;
  unit: string;
  label: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  goal,
  unit,
  label,
  color = colors.primary,
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {Math.round(current)}{unit} / {goal}{unit}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: isOverGoal ? colors.warning : color,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressPercentage, isOverGoal && styles.overGoal]}>
        {Math.round(percentage)}%
      </Text>
    </View>
  );
};

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  summary,
  goals,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Nutrition Summary</Text>
      
      <View style={styles.macroGrid}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(summary.totalCalories)}</Text>
          <Text style={styles.macroLabel}>Calories</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(summary.totalProtein)}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(summary.totalCarbs)}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(summary.totalFat)}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          current={summary.totalCalories}
          goal={goals.calories}
          unit=""
          label="Calories"
          color={colors.primary}
        />
        <ProgressBar
          current={summary.totalProtein}
          goal={goals.protein}
          unit="g"
          label="Protein"
          color={colors.success}
        />
        <ProgressBar
          current={summary.totalCarbs}
          goal={goals.carbs}
          unit="g"
          label="Carbohydrates"
          color={colors.info}
        />
        <ProgressBar
          current={summary.totalFat}
          goal={goals.fat}
          unit="g"
          label="Fat"
          color={colors.warning}
        />
      </View>

      {summary.totalFiber > 0 && (
        <View style={styles.additionalNutrients}>
          <Text style={styles.additionalTitle}>Additional Nutrients</Text>
          <View style={styles.additionalGrid}>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalValue}>{Math.round(summary.totalFiber)}g</Text>
              <Text style={styles.additionalLabel}>Fiber</Text>
            </View>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalValue}>{Math.round(summary.totalSugar)}g</Text>
              <Text style={styles.additionalLabel}>Sugar</Text>
            </View>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalValue}>{Math.round(summary.totalSodium)}mg</Text>
              <Text style={styles.additionalLabel}>Sodium</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  progressSection: {
    gap: 16,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  progressValue: {
    fontSize: 12,
    color: colors.gray[600],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 11,
    color: colors.gray[500],
    textAlign: 'right',
  },
  overGoal: {
    color: colors.warning,
    fontWeight: '600',
  },
  additionalNutrients: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  additionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  additionalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  additionalItem: {
    alignItems: 'center',
  },
  additionalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 2,
  },
  additionalLabel: {
    fontSize: 11,
    color: colors.gray[500],
  },
});