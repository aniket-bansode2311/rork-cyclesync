import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { 
  BookOpen, 
  Play,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Calendar,
  Heart,
  Baby,
  Zap,
  AlertCircle,
  Sunset,
  Shield,
  ArrowLeft
} from "lucide-react-native";

import colors from "@/constants/colors";
import { useEducation } from "@/hooks/useEducation";

const categoryConfig = {
  periods: {
    title: "Periods",
    icon: Calendar,
    color: colors.primary,
  },
  fertility: {
    title: "Fertility",
    icon: Heart,
    color: "#E91E63",
  },
  pregnancy: {
    title: "Pregnancy",
    icon: Baby,
    color: "#FF9800",
  },
  wellness: {
    title: "Wellness",
    icon: Zap,
    color: "#4CAF50",
  },
  conditions: {
    title: "Conditions",
    icon: AlertCircle,
    color: "#F44336",
  },
  menopause: {
    title: "Menopause",
    icon: Sunset,
    color: "#9C27B0",
  },
  "birth-control": {
    title: "Birth Control",
    icon: Shield,
    color: "#2196F3",
  },
} as const;

export default function EducationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getContentById, toggleBookmark, isBookmarked } = useEducation();

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Content not found</Text>
      </SafeAreaView>
    );
  }

  const content = getContentById(id);

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Content not found</Text>
      </SafeAreaView>
    );
  }

  const categoryInfo = categoryConfig[content.category];
  const ContentIcon = content.type === 'video' ? Play : BookOpen;
  const BookmarkIcon = isBookmarked(content.id) ? BookmarkCheck : Bookmark;

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this ${content.type}: ${content.title}\n\n${content.description}`,
        title: content.title,
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          // Fallback for web browsers without native share
          await navigator.clipboard.writeText(shareContent.message);
          alert('Content copied to clipboard!');
        }
      } else {
        await Share.share(shareContent);
      }
    } catch (error) {
      console.log('Error sharing content:', error);
    }
  };

  const handleVideoPlay = () => {
    // In a real app, this would open a video player
    console.log('Playing video:', content.videoUrl);
    alert('Video player would open here');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              testID="back-button"
            >
              <ArrowLeft size={24} color={colors.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => toggleBookmark(content.id)}
                style={styles.headerButton}
                testID="bookmark-button"
              >
                <BookmarkIcon 
                  size={20} 
                  color={isBookmarked(content.id) ? colors.primary : colors.gray[400]} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
                testID="share-button"
              >
                <Share2 size={20} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Hero Image */}
            <View style={styles.heroContainer}>
              <Image source={{ uri: content.imageUrl }} style={styles.heroImage} />
              {content.type === 'video' && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handleVideoPlay}
                  testID="play-video-button"
                >
                  <Play size={32} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>

            {/* Content Header */}
            <View style={styles.contentHeader}>
              <View style={styles.contentMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                  <categoryInfo.icon size={14} color={categoryInfo.color} />
                  <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                    {categoryInfo.title}
                  </Text>
                </View>
                <View style={styles.contentType}>
                  <ContentIcon size={14} color={colors.gray[500]} />
                  <Text style={styles.contentTypeText}>
                    {content.type === 'video' ? 'Video' : 'Article'}
                  </Text>
                </View>
              </View>

              <Text style={styles.contentTitle}>{content.title}</Text>
              <Text style={styles.contentDescription}>{content.description}</Text>

              <View style={styles.contentInfo}>
                <View style={styles.contentDuration}>
                  <Clock size={16} color={colors.gray[500]} />
                  <Text style={styles.contentDurationText}>
                    {content.duration} min {content.type === 'video' ? 'watch' : 'read'}
                  </Text>
                </View>
                <Text style={styles.contentDate}>
                  Updated {content.updatedAt.toLocaleDateString()}
                </Text>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {content.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Content Body */}
            <View style={styles.contentBody}>
              <Text style={styles.contentText}>{content.content}</Text>
              
              {/* Placeholder for additional content sections */}
              <View style={styles.additionalContent}>
                <Text style={styles.sectionTitle}>Key Takeaways</Text>
                <View style={styles.takeawaysList}>
                  <Text style={styles.takeawayItem}>• Understanding your body&apos;s natural rhythms is important for overall health</Text>
                  <Text style={styles.takeawayItem}>• Track patterns and changes to better understand your cycle</Text>
                  <Text style={styles.takeawayItem}>• Consult with healthcare providers for personalized advice</Text>
                </View>
              </View>

              {content.type === 'article' && (
                <View style={styles.additionalContent}>
                  <Text style={styles.sectionTitle}>Related Topics</Text>
                  <Text style={styles.relatedText}>
                    Explore more content about {categoryInfo.title.toLowerCase()} to deepen your understanding.
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookmarkActionButton]}
                onPress={() => toggleBookmark(content.id)}
                testID="bookmark-action-button"
              >
                <BookmarkIcon 
                  size={20} 
                  color={isBookmarked(content.id) ? colors.white : colors.primary} 
                />
                <Text style={[
                  styles.actionButtonText,
                  isBookmarked(content.id) && styles.actionButtonTextActive
                ]}>
                  {isBookmarked(content.id) ? 'Bookmarked' : 'Bookmark'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.shareActionButton]}
                onPress={handleShare}
                testID="share-action-button"
              >
                <Share2 size={20} color={colors.gray[600]} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
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
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentHeader: {
    padding: 20,
    backgroundColor: colors.white,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
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
  contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
    lineHeight: 32,
  },
  contentDescription: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 24,
    marginBottom: 16,
  },
  contentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentDurationText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  contentDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '500',
  },
  contentBody: {
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  contentText: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 26,
    marginBottom: 24,
  },
  additionalContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  takeawaysList: {
    gap: 8,
  },
  takeawayItem: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 22,
  },
  relatedText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookmarkActionButton: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  shareActionButton: {
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtonTextActive: {
    color: colors.white,
  },
});