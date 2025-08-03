import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { 
  BookOpen, 
  Play,
  Clock,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Heart,
  Baby,
  Zap,
  AlertCircle,
  Sunset,
  Shield
} from "lucide-react-native";

import colors from "@/constants/colors";
import { useEducation } from "@/hooks/useEducation";
import { ContentCategory, EducationalContent } from "@/types/education";

const categoryConfig = {
  periods: {
    title: "Periods",
    icon: Calendar,
    color: colors.primary,
    description: "Understanding your menstrual cycle and period health"
  },
  fertility: {
    title: "Fertility",
    icon: Heart,
    color: "#E91E63",
    description: "Tracking and understanding fertility and ovulation"
  },
  pregnancy: {
    title: "Pregnancy",
    icon: Baby,
    color: "#FF9800",
    description: "Pregnancy journey, care, and what to expect"
  },
  wellness: {
    title: "Wellness",
    icon: Zap,
    color: "#4CAF50",
    description: "Health, nutrition, and lifestyle tips"
  },
  conditions: {
    title: "Conditions",
    icon: AlertCircle,
    color: "#F44336",
    description: "Understanding reproductive health conditions"
  },
  menopause: {
    title: "Menopause",
    icon: Sunset,
    color: "#9C27B0",
    description: "Menopause, perimenopause, and hormonal changes"
  },
  "birth-control": {
    title: "Birth Control",
    icon: Shield,
    color: "#2196F3",
    description: "Contraception options and reproductive choices"
  },
} as const;

export default function EducationCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: ContentCategory }>();
  const { getContentByCategory, toggleBookmark, isBookmarked } = useEducation();

  if (!category || !(category in categoryConfig)) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Category not found</Text>
      </SafeAreaView>
    );
  }

  const categoryInfo = categoryConfig[category];
  const content = getContentByCategory(category);
  const IconComponent = categoryInfo.icon;

  const handleContentPress = (contentId: string) => {
    router.push({
      pathname: "/(app)/education-detail",
      params: { id: contentId }
    });
  };

  const renderContentCard = (item: EducationalContent) => {
    const ContentIcon = item.type === 'video' ? Play : BookOpen;
    const BookmarkIcon = isBookmarked(item.id) ? BookmarkCheck : Bookmark;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.contentCard}
        onPress={() => handleContentPress(item.id)}
        testID={`content-${item.id}`}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.contentImage} />
        <View style={styles.contentInfo}>
          <View style={styles.contentHeader}>
            <View style={styles.contentMeta}>
              <View style={styles.contentType}>
                <ContentIcon size={14} color={colors.gray[500]} />
                <Text style={styles.contentTypeText}>
                  {item.type === 'video' ? 'Video' : 'Article'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleBookmark(item.id)}
                style={styles.bookmarkButton}
                testID={`bookmark-${item.id}`}
              >
                <BookmarkIcon 
                  size={16} 
                  color={isBookmarked(item.id) ? colors.primary : colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.contentTitle}>{item.title}</Text>
            <Text style={styles.contentDescription}>{item.description}</Text>
          </View>
          <View style={styles.contentFooter}>
            <View style={styles.contentDuration}>
              <Clock size={14} color={colors.gray[500]} />
              <Text style={styles.contentDurationText}>
                {item.duration} min {item.type === 'video' ? 'watch' : 'read'}
              </Text>
            </View>
            <View style={styles.contentTags}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
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
          title: categoryInfo.title,
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                <IconComponent size={32} color={categoryInfo.color} />
              </View>
              <Text style={styles.categoryTitle}>{categoryInfo.title}</Text>
              <Text style={styles.categoryDescription}>{categoryInfo.description}</Text>
              <Text style={styles.categoryCount}>
                {content.length} {content.length === 1 ? 'item' : 'items'} available
              </Text>
            </View>

            {/* Content List */}
            <View style={styles.contentSection}>
              {content.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconComponent size={48} color={colors.gray[300]} />
                  <Text style={styles.emptyStateTitle}>No content available</Text>
                  <Text style={styles.emptyStateDescription}>
                    Check back later for new {categoryInfo.title.toLowerCase()} content
                  </Text>
                </View>
              ) : (
                <View style={styles.contentList}>
                  {content.map(renderContentCard)}
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
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 40,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  contentSection: {
    flex: 1,
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
  contentDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentDurationText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  contentTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: colors.gray[600],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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