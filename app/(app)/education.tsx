import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { 
  BookOpen, 
  Search, 
  Filter,
  Calendar,
  Heart,
  Baby,
  Zap,
  AlertCircle,
  Sunset,
  Shield,
  Play,
  Clock,
  Bookmark,
  BookmarkCheck
} from "lucide-react-native";

import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useEducation } from "@/hooks/useEducation";
import { ContentCategory, EducationalContent } from "@/types/education";

const categoryConfig = {
  periods: {
    title: "Periods",
    icon: Calendar,
    color: colors.primary,
    description: "Understanding your menstrual cycle"
  },
  fertility: {
    title: "Fertility",
    icon: Heart,
    color: "#E91E63",
    description: "Tracking and understanding fertility"
  },
  pregnancy: {
    title: "Pregnancy",
    icon: Baby,
    color: "#FF9800",
    description: "Pregnancy journey and care"
  },
  wellness: {
    title: "Wellness",
    icon: Zap,
    color: "#4CAF50",
    description: "Health and lifestyle tips"
  },
  conditions: {
    title: "Conditions",
    icon: AlertCircle,
    color: "#F44336",
    description: "Understanding health conditions"
  },
  menopause: {
    title: "Menopause",
    icon: Sunset,
    color: "#9C27B0",
    description: "Menopause and perimenopause"
  },
  "birth-control": {
    title: "Birth Control",
    icon: Shield,
    color: "#2196F3",
    description: "Contraception options and info"
  },
} as const;

export default function EducationScreen() {
  const router = useRouter();
  const { 
    filteredContent, 
    searchQuery, 
    setSearchQuery, 
    selectedFilters, 
    setSelectedFilters,
    getContentByCategory,
    toggleBookmark,
    isBookmarked
  } = useEducation();
  
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleCategoryPress = (category: ContentCategory) => {
    router.push({
      pathname: "/(app)/education-category",
      params: { category }
    });
  };

  const handleContentPress = (contentId: string) => {
    router.push({
      pathname: "/(app)/education-detail",
      params: { id: contentId }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery.trim() || selectedFilters.category || selectedFilters.type;

  const renderContentCard = (content: EducationalContent) => {
    const categoryInfo = categoryConfig[content.category];
    const IconComponent = content.type === 'video' ? Play : BookOpen;
    const BookmarkIcon = isBookmarked(content.id) ? BookmarkCheck : Bookmark;

    return (
      <TouchableOpacity
        key={content.id}
        style={styles.contentCard}
        onPress={() => handleContentPress(content.id)}
        testID={`content-${content.id}`}
      >
        <Image source={{ uri: content.imageUrl }} style={styles.contentImage} />
        <View style={styles.contentInfo}>
          <View style={styles.contentHeader}>
            <View style={styles.contentMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                <categoryInfo.icon size={12} color={categoryInfo.color} />
                <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                  {categoryInfo.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleBookmark(content.id)}
                style={styles.bookmarkButton}
                testID={`bookmark-${content.id}`}
              >
                <BookmarkIcon 
                  size={16} 
                  color={isBookmarked(content.id) ? colors.primary : colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentDescription}>{content.description}</Text>
          </View>
          <View style={styles.contentFooter}>
            <View style={styles.contentType}>
              <IconComponent size={14} color={colors.gray[500]} />
              <Text style={styles.contentTypeText}>
                {content.type === 'video' ? 'Video' : 'Article'}
              </Text>
            </View>
            <View style={styles.contentDuration}>
              <Clock size={14} color={colors.gray[500]} />
              <Text style={styles.contentDurationText}>
                {content.duration} min {content.type === 'video' ? 'watch' : 'read'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Education Library",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={colors.gray[400]} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search articles and videos..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  testID="search-input"
                />
              </View>
              <TouchableOpacity
                style={[styles.filterButton, showFilters && styles.filterButtonActive]}
                onPress={() => setShowFilters(!showFilters)}
                testID="filter-button"
              >
                <Filter size={20} color={showFilters ? colors.white : colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            {showFilters && (
              <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Filter by type:</Text>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedFilters.type === 'article' && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedFilters(prev => ({
                      ...prev,
                      type: prev.type === 'article' ? undefined : 'article'
                    }))}
                    testID="filter-article"
                  >
                    <BookOpen size={16} color={selectedFilters.type === 'article' ? colors.white : colors.primary} />
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.type === 'article' && styles.filterChipTextActive
                    ]}>
                      Articles
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedFilters.type === 'video' && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedFilters(prev => ({
                      ...prev,
                      type: prev.type === 'video' ? undefined : 'video'
                    }))}
                    testID="filter-video"
                  >
                    <Play size={16} color={selectedFilters.type === 'video' ? colors.white : colors.primary} />
                    <Text style={[
                      styles.filterChipText,
                      selectedFilters.type === 'video' && styles.filterChipTextActive
                    ]}>
                      Videos
                    </Text>
                  </TouchableOpacity>
                </View>
                {hasActiveFilters && (
                  <Button
                    title="Clear Filters"
                    variant="text"
                    size="small"
                    onPress={clearFilters}
                    testID="clear-filters"
                  />
                )}
              </View>
            )}

            {/* Categories Grid */}
            {!hasActiveFilters && (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <View style={styles.categoriesGrid}>
                  {(Object.keys(categoryConfig) as ContentCategory[]).map((category) => {
                    const config = categoryConfig[category];
                    const contentCount = getContentByCategory(category).length;
                    
                    return (
                      <TouchableOpacity
                        key={category}
                        style={[styles.categoryCard, { borderColor: config.color + '30' }]}
                        onPress={() => handleCategoryPress(category)}
                        testID={`category-${category}`}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}>
                          <config.icon size={24} color={config.color} />
                        </View>
                        <Text style={styles.categoryTitle}>{config.title}</Text>
                        <Text style={styles.categoryDescription}>{config.description}</Text>
                        <Text style={styles.categoryCount}>
                          {contentCount} {contentCount === 1 ? 'item' : 'items'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Search Results or Recent Content */}
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                {hasActiveFilters ? 'Search Results' : 'Recent Content'}
              </Text>
              {filteredContent.length === 0 ? (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color={colors.gray[300]} />
                  <Text style={styles.emptyStateTitle}>
                    {hasActiveFilters ? 'No results found' : 'No content available'}
                  </Text>
                  <Text style={styles.emptyStateDescription}>
                    {hasActiveFilters 
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for new educational content'
                    }
                  </Text>
                </View>
              ) : (
                <View style={styles.contentList}>
                  {filteredContent.slice(0, hasActiveFilters ? undefined : 6).map(renderContentCard)}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  filterButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '500',
  },
  contentSection: {
    marginBottom: 20,
  },
  contentList: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  contentImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.gray[100],
  },
  contentInfo: {
    padding: 16,
  },
  contentHeader: {
    marginBottom: 12,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 4,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentTypeText: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  contentDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentDurationText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});