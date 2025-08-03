import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Send, X } from 'lucide-react-native';
import { useForum } from '@/hooks/useForum';
import { colors } from '@/constants/colors';

export default function ForumCreateThreadScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { getCategoryById, createThread, isLoading } = useForum();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const category = getCategoryById(categoryId || '');

  useEffect(() => {
    if (!category) {
      Alert.alert('Error', 'Category not found');
      router.back();
    }
  }, [category]);

  const handleCreateThread = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      await createThread({
        categoryId,
        title: title.trim(),
        content: content.trim()
      });
      
      Alert.alert(
        'Success', 
        'Your thread has been created!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to create thread');
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  if (!category) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: 'New Thread',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleCancel}
              style={styles.headerButton}
            >
              <X size={24} color={colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleCreateThread}
              style={[
                styles.headerButton,
                (!title.trim() || !content.trim() || isLoading) && styles.headerButtonDisabled
              ]}
              disabled={!title.trim() || !content.trim() || isLoading}
            >
              <Send size={20} color={colors.white} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Info */}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryLabel}>Posting in</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>
            {category.description}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thread Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What would you like to discuss?"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
              placeholderTextColor={colors.gray[400]}
              autoFocus
            />
            <Text style={styles.characterCount}>
              {title.length}/200
            </Text>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
              placeholderTextColor={colors.gray[400]}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {content.length}/2000
            </Text>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful and supportive{'\n'}
              • Stay on topic for this category{'\n'}
              • Share experiences, not medical advice{'\n'}
              • Use clear, descriptive titles{'\n'}
              • Search before posting to avoid duplicates
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!title.trim() || !content.trim() || isLoading) && styles.createButtonDisabled
          ]}
          onPress={handleCreateThread}
          disabled={!title.trim() || !content.trim() || isLoading}
        >
          <Send size={16} color={colors.white} />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Thread'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  categoryInfo: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
  },
  titleInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 50,
  },
  contentInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 200,
    maxHeight: 300,
  },
  characterCount: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: 4,
  },
  guidelines: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: '600' as const,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  createButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600' as const,
  },
});