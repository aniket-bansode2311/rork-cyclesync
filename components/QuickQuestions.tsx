import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { QuickQuestion } from '@/types/healthCoach';

interface QuickQuestionsProps {
  questions: QuickQuestion[];
  onQuestionPress: (questionText: string) => void;
}

export function QuickQuestions({ questions, onQuestionPress }: QuickQuestionsProps) {
  const getCategoryColor = (category: QuickQuestion['category']) => {
    switch (category) {
      case 'period':
        return '#EF4444';
      case 'symptoms':
        return '#F59E0B';
      case 'nutrition':
        return '#10B981';
      case 'general':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Questions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {questions.map((question) => (
          <TouchableOpacity
            key={question.id}
            style={[
              styles.questionButton,
              { borderColor: getCategoryColor(question.category) },
            ]}
            onPress={() => onQuestionPress(question.text)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: getCategoryColor(question.category) },
              ]}
            />
            <Text style={styles.questionText}>{question.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingLeft: 16,
  },
  questionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  questionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});