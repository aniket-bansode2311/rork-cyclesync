import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { 
  MessageCircle, 
  Plus, 
  Pin,
  Lock,
  Eye,
  MessageSquare,
  Clock
} from 'lucide-react-native';
import { useForum } from '@/hooks/useForum';
import { colors } from '@/constants/colors';

export default function ForumCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { 
    getCategoryById, 
    getThreadsByCategory, 
    incrementViewCount 
  } = useForum();

  const category = getCategoryById(categoryId || '');
  const threads = getThreadsByCategory(categoryId || '');

  useEffect(() => {
    if (!category) {
      Alert.alert('Error', 'Category not found');
      router.back();
    }
  }, [category]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleThreadPress = (threadId: string) => {
    incrementViewCount(threadId);
    router.push(`/forum-thread?threadId=${threadId}`);
  };

  const handleCreateThread = () => {
    router.push(`/forum-create-thread?categoryId=${categoryId}`);
  };

  if (!category) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: category.name,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleCreateThread}
              style={styles.headerButton}
            >
              <Plus size={24} color={colors.white} />
            </TouchableOpacity>
          )
        }} 
      />
      
      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryDescription}>
          {category.description}
        </Text>
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <MessageCircle size={16} color={colors.primary} />
            <Text style={styles.statText}>{category.threadCount} threads</Text>
          </View>
          {category.lastActivity && (
            <View style={styles.statItem}>
              <Clock size={16} color={colors.gray[500]} />
              <Text style={styles.statText}>
                Last activity {formatDate(category.lastActivity)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {threads.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No discussions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to start a conversation in this category
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateThread}
            >
              <Plus size={20} color={colors.white} />
              <Text style={styles.createButtonText}>Create Thread</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.threadsContainer}>
            {threads.map((thread) => (
              <TouchableOpacity
                key={thread.id}
                style={[
                  styles.threadCard,
                  thread.isPinned && styles.pinnedThread
                ]}
                onPress={() => handleThreadPress(thread.id)}
              >
                <View style={styles.threadHeader}>
                  <View style={styles.threadTitleRow}>
                    {thread.isPinned && (
                      <Pin size={16} color={colors.primary} style={styles.pinIcon} />
                    )}
                    {thread.isLocked && (
                      <Lock size={16} color={colors.gray[500]} style={styles.lockIcon} />
                    )}
                    <Text 
                      style={[
                        styles.threadTitle,
                        thread.isPinned && styles.pinnedThreadTitle
                      ]} 
                      numberOfLines={2}
                    >
                      {thread.title}
                    </Text>
                  </View>
                  
                  <View style={styles.threadMeta}>
                    <Text style={styles.threadAuthor}>by {thread.author.username}</Text>
                    <Text style={styles.threadDate}>
                      {formatDate(thread.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.threadContent} numberOfLines={3}>
                  {thread.content}
                </Text>

                <View style={styles.threadFooter}>
                  <View style={styles.threadStats}>
                    <View style={styles.threadStatItem}>
                      <MessageSquare size={16} color={colors.gray[500]} />
                      <Text style={styles.threadStatText}>
                        {thread.replyCount} replies
                      </Text>
                    </View>
                    <View style={styles.threadStatItem}>
                      <Eye size={16} color={colors.gray[500]} />
                      <Text style={styles.threadStatText}>
                        {thread.viewCount} views
                      </Text>
                    </View>
                  </View>
                  
                  {thread.lastReply && (
                    <View style={styles.lastReply}>
                      <Text style={styles.lastReplyText}>
                        Last reply by {thread.lastReply.author}
                      </Text>
                      <Text style={styles.lastReplyDate}>
                        {formatDate(thread.lastReply.createdAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreateThread}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
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
  categoryInfo: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  categoryDescription: {
    fontSize: 16,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 12,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  threadsContainer: {
    padding: 16,
    gap: 12,
  },
  threadCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  pinnedThread: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  threadHeader: {
    marginBottom: 12,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  pinIcon: {
    marginTop: 2,
  },
  lockIcon: {
    marginTop: 2,
  },
  threadTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.black,
    lineHeight: 24,
  },
  pinnedThreadTitle: {
    color: colors.primary,
  },
  threadMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadAuthor: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500' as const,
  },
  threadDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  threadContent: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: 16,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  threadStats: {
    flexDirection: 'row',
    gap: 16,
  },
  threadStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threadStatText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  lastReply: {
    alignItems: 'flex-end',
  },
  lastReplyText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  lastReplyDate: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});