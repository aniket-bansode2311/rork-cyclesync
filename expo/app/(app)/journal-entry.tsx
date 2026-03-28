import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Save, X, Tag, Smile } from 'lucide-react-native';
import { useJournal } from '@/hooks/useJournal';
import { JournalEntry } from '@/types/journal';

const moodOptions = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'excited', emoji: '🤩', label: 'Excited' },
  { key: 'stressed', emoji: '😤', label: 'Stressed' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
];

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { allEntries, addEntry, updateEntry } = useJournal();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const isEditing = !!id;
  const existingEntry = isEditing ? allEntries.find(entry => entry.id === id) : null;

  // Load existing entry data if editing
  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setContent(existingEntry.content);
      setMood(existingEntry.mood);
      setTags(existingEntry.tags);
    }
  }, [existingEntry]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your journal entry.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write something in your journal entry.');
      return;
    }

    setIsLoading(true);

    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        date: existingEntry?.date || new Date().toISOString().split('T')[0],
      };

      if (isEditing && existingEntry) {
        await updateEntry(existingEntry.id, entryData);
      } else {
        await addEntry(entryData);
      }

      router.back();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const selectedMood = moodOptions.find(option => option.key === mood);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Entry' : 'New Journal Entry',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
              testID="cancel-button"
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.headerButton}
              disabled={isLoading}
              testID="save-button"
            >
              <Save size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What's on your mind?"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            testID="title-input"
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Mood Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How are you feeling?</Text>
          <TouchableOpacity
            style={styles.moodSelector}
            onPress={() => setShowMoodPicker(!showMoodPicker)}
            testID="mood-selector"
          >
            <View style={styles.selectedMood}>
              <Text style={styles.moodEmoji}>{selectedMood?.emoji}</Text>
              <Text style={styles.moodLabel}>{selectedMood?.label}</Text>
            </View>
            <Smile size={20} color="#8B5CF6" />
          </TouchableOpacity>

          {showMoodPicker && (
            <View style={styles.moodPicker}>
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.moodOption,
                    mood === option.key && styles.moodOptionSelected,
                  ]}
                  onPress={() => {
                    setMood(option.key as JournalEntry['mood']);
                    setShowMoodPicker(false);
                  }}
                  testID={`mood-option-${option.key}`}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text style={styles.moodOptionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your thoughts</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write about your day, feelings, thoughts, or anything else..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={5000}
            testID="content-input"
          />
          <Text style={styles.characterCount}>{content.length}/5000</Text>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
              testID="tag-input"
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              testID="add-tag-button"
            >
              <Tag size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                  testID={`tag-${index}`}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                  <X size={16} color="#8B5CF6" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            🔒 Your journal entries are encrypted and stored securely on your device.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  moodSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  moodPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  moodOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  moodOptionLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  privacyText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    lineHeight: 20,
  },
});