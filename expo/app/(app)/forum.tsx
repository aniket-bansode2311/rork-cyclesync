import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  MessageCircle, 
  Search, 
  Users, 
  TrendingUp,
  Heart,
  Shield,
  Baby,
  Flower
} from 'lucide-react-native';
import { useForum } from '@/hooks/useForum';
import { colors } from '@/constants/colors';

const iconMap: Record<string, any> = {
  MessageCircle,
  Heart,
  Users,
  Shield,
  Baby,
  Flower
};

export default function ForumScreen() {
  const { categories, searchForum, searchResults } = useForum();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchForum(query);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/forum-category?categoryId=${categoryId}`);
  };

  const handleSearchResultPress = (result: any) => {
    if (result.type === 'thread') {
      router.push(`/forum-thread?threadId=${result.id}`);
    } else {
      // For reply results, navigate to the thread
      router.push(`/forum-thread?threadId=${result.threadId}`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Community Forum',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const }
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showSearchResults ? (
          <View style={styles.searchResults}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Search size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No results found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try different keywords or browse categories below
                </Text>
              </View>
            ) : (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={`${result.type}-${result.id}`}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultPress(result)}
                >
                  <View style={styles.searchResultHeader}>
                    <Text style={styles.searchResultType}>
                      {result.type === 'thread' ? 'Thread' : 'Reply'}
                    </Text>
                    <Text style={styles.searchResultCategory}>
                      {result.categoryName}
                    </Text>
                  </View>
                  <Text style={styles.searchResultTitle} numberOfLines={2}>
                    {result.title}
                  </Text>
                  <Text style={styles.searchResultContent} numberOfLines={3}>
                    {result.content}
                  </Text>
                  <View style={styles.searchResultFooter}>
                    <Text style={styles.searchResultAuthor}>by {result.author}</Text>
                    <Text style={styles.searchResultDate}>
                      {formatDate(result.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <TrendingUp size={24} color={colors.primary} />
                <Text style={styles.statNumber}>1.2k</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle size={24} color={colors.secondary} />
                <Text style={styles.statNumber}>180</Text>
                <Text style={styles.statLabel}>Total Threads</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={24} color={colors.tertiary} />
                <Text style={styles.statNumber}>2.5k</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discussion Categories</Text>
            </View>

            <View style={styles.categoriesContainer}>
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon] || MessageCircle;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryIcon}>
                        <IconComponent size={24} color={colors.primary} />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryDescription} numberOfLines={2}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.categoryStats}>
                      <View style={styles.categoryStatItem}>
                        <Text style={styles.categoryStatNumber}>
                          {category.threadCount}
                        </Text>
                        <Text style={styles.categoryStatLabel}>threads</Text>
                      </View>
                      {category.lastActivity && (
                        <Text style={styles.categoryLastActivity}>
                          {formatDate(category.lastActivity)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Community Guidelines */}
            <View style={styles.guidelinesContainer}>
              <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
              <Text style={styles.guidelinesText}>
                • Be respectful and supportive of all members{'\n'}
                • Share experiences, not medical advice{'\n'}
                • Keep discussions relevant to women&apos;s health{'\n'}
                • Report inappropriate content to moderators
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  content: {
    flex: 1,
  },
  searchResults: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.black,
  },
  clearButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  searchResultItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchResultType: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  searchResultCategory: {
    fontSize: 12,
    color: colors.gray[500],
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  searchResultContent: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 12,
  },
  searchResultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultAuthor: {
    fontSize: 12,
    color: colors.gray[500],
  },
  searchResultDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.black,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.black,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryStatItem: {
    alignItems: 'center',
  },
  categoryStatNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary,
  },
  categoryStatLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  categoryLastActivity: {
    fontSize: 12,
    color: colors.gray[400],
  },
  guidelinesContainer: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.black,
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 22,
  },
});