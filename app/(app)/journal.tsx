import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Search, Filter, TrendingUp } from 'lucide-react-native';
import { useJournal } from '@/hooks/useJournal';
import { JournalEntry } from '@/types/journal';

const moodColors = {
  happy: '#FFD700',
  sad: '#87CEEB',
  anxious: '#FFA07A',
  calm: '#98FB98',
  excited: '#FF69B4',
  stressed: '#DC143C',
  neutral: '#D3D3D3',
};

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  stressed: '😤',
  neutral: '😐',
};

export default function JournalScreen() {
  const { entries, isLoading, filters, stats, setFilters } = useJournal();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, searchQuery: query });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderEntry = (entry: JournalEntry) => (
    <TouchableOpacity
      key={entry.id}
      style={styles.entryCard}
      onPress={() => router.push(`/journal-entry?id=${entry.id}`)}
      testID={`journal-entry-${entry.id}`}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryDateMood}>
          <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
          <View style={[styles.moodIndicator, { backgroundColor: moodColors[entry.mood] }]}>
            <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
          </View>
        </View>
        {entry.encrypted && (
          <View style={styles.encryptedBadge}>
            <Text style={styles.encryptedText}>🔒</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.entryTitle} numberOfLines={1}>
        {entry.title}
      </Text>
      
      <Text style={styles.entryContent} numberOfLines={3}>
        {truncateContent(entry.content)}
      </Text>
      
      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {entry.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{entry.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalEntries}</Text>
        <Text style={styles.statLabel}>Total Entries</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.entriesThisMonth}</Text>
        <Text style={styles.statLabel}>This Month</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.currentStreak}</Text>
        <Text style={styles.statLabel}>Current Streak</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statEmoji}>{moodEmojis[stats.mostUsedMood as keyof typeof moodEmojis]}</Text>
        <Text style={styles.statLabel}>Most Used Mood</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Journal',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={styles.headerButton}
                testID="filter-button"
              >
                <Filter size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/journal-stats')}
                style={styles.headerButton}
                testID="stats-button"
              >
                <TrendingUp size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your journal..."
              value={searchQuery}
              onChangeText={handleSearch}
              testID="search-input"
            />
          </View>
        </View>

        {/* Stats Overview */}
        {renderStats()}

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, !filters.mood && styles.filterChipActive]}
                onPress={() => setFilters({ ...filters, mood: undefined })}
              >
                <Text style={[styles.filterChipText, !filters.mood && styles.filterChipTextActive]}>
                  All Moods
                </Text>
              </TouchableOpacity>
              {Object.entries(moodEmojis).map(([mood, emoji]) => (
                <TouchableOpacity
                  key={mood}
                  style={[styles.filterChip, filters.mood === mood && styles.filterChipActive]}
                  onPress={() => setFilters({ ...filters, mood: mood === filters.mood ? undefined : mood })}
                >
                  <Text style={[styles.filterChipText, filters.mood === mood && styles.filterChipTextActive]}>
                    {emoji} {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Entries List */}
        <View style={styles.entriesContainer}>
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesTitle}>
              {entries.length > 0 ? `${entries.length} Entries` : 'No entries yet'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/journal-entry')}
              style={styles.addButton}
              testID="add-entry-button"
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>New Entry</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your journal...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Start Your Journal Journey</Text>
              <Text style={styles.emptyDescription}>
                Capture your thoughts, feelings, and experiences in a safe, private space.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/journal-entry')}
                style={styles.emptyButton}
                testID="empty-add-button"
              >
                <Plus size={24} color="#8B5CF6" />
                <Text style={styles.emptyButtonText}>Write Your First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {entries.map(renderEntry)}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  entriesList: {
    gap: 16,
    paddingBottom: 32,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDateMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  moodIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 16,
  },
  encryptedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  encryptedText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});