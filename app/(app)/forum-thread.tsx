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
import { 
  MessageSquare, 
  Heart,
  Send,
  Eye,
  User,
  Pin,
  Lock
} from 'lucide-react-native';
import { useForum } from '@/hooks/useForum';
import { colors } from '@/constants/colors';

export default function ForumThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { 
    getThreadById, 
    getCategoryById,
    getRepliesByThread, 
    createReply,
    toggleLike,
    isLoading
  } = useForum();

  const [replyText, setReplyText] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const thread = getThreadById(threadId || '');
  const category = thread ? getCategoryById(thread.categoryId) : null;
  const replies = getRepliesByThread(threadId || '');

  useEffect(() => {
    if (!thread) {
      Alert.alert('Error', 'Thread not found');
      router.back();
    }
  }, [thread]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !threadId) return;
    
    try {
      await createReply({
        threadId,
        content: replyText.trim()
      });
      setReplyText('');
      setIsReplying(false);
    } catch {
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      await toggleLike(replyId);
    } catch {
      Alert.alert('Error', 'Failed to like reply');
    }
  };

  if (!thread || !category) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: category.name,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const }
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thread Header */}
        <View style={styles.threadContainer}>
          <View style={styles.threadHeader}>
            <View style={styles.threadTitleRow}>
              {thread.isPinned && (
                <Pin size={18} color={colors.primary} style={styles.pinIcon} />
              )}
              {thread.isLocked && (
                <Lock size={18} color={colors.gray[500]} style={styles.lockIcon} />
              )}
              <Text style={[
                styles.threadTitle,
                thread.isPinned && styles.pinnedThreadTitle
              ]}>
                {thread.title}
              </Text>
            </View>
            
            <View style={styles.threadMeta}>
              <View style={styles.authorInfo}>
                <View style={styles.avatar}>
                  <User size={20} color={colors.gray[500]} />
                </View>
                <View>
                  <Text style={styles.authorName}>{thread.author.username}</Text>
                  <Text style={styles.threadDate}>
                    {formatDate(thread.createdAt)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.threadStats}>
                <View style={styles.statItem}>
                  <Eye size={16} color={colors.gray[500]} />
                  <Text style={styles.statText}>{thread.viewCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <MessageSquare size={16} color={colors.gray[500]} />
                  <Text style={styles.statText}>{thread.replyCount}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.threadContent}>
            {thread.content}
          </Text>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <View style={styles.repliesHeader}>
            <Text style={styles.repliesTitle}>
              Replies ({replies.length})
            </Text>
          </View>

          {replies.length === 0 ? (
            <View style={styles.noReplies}>
              <MessageSquare size={48} color={colors.gray[300]} />
              <Text style={styles.noRepliesText}>No replies yet</Text>
              <Text style={styles.noRepliesSubtext}>
                Be the first to join the conversation
              </Text>
            </View>
          ) : (
            <View style={styles.repliesContainer}>
              {replies.map((reply) => (
                <View key={reply.id} style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <View style={styles.replyAuthorInfo}>
                      <View style={styles.replyAvatar}>
                        <User size={16} color={colors.gray[500]} />
                      </View>
                      <View>
                        <Text style={styles.replyAuthorName}>
                          {reply.author.username}
                        </Text>
                        <Text style={styles.replyDate}>
                          {formatDate(reply.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.replyContent}>
                    {reply.content}
                  </Text>

                  <View style={styles.replyFooter}>
                    <TouchableOpacity 
                      style={[
                        styles.likeButton,
                        reply.isLiked && styles.likedButton
                      ]}
                      onPress={() => handleLikeReply(reply.id)}
                    >
                      <Heart 
                        size={16} 
                        color={reply.isLiked ? colors.secondary : colors.gray[500]}
                        fill={reply.isLiked ? colors.secondary : 'none'}
                      />
                      <Text style={[
                        styles.likeText,
                        reply.isLiked && styles.likedText
                      ]}>
                        {reply.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reply Input */}
      {!thread.isLocked && (
        <View style={styles.replyInputContainer}>
          {isReplying ? (
            <View style={styles.replyInputExpanded}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write your reply..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={1000}
                placeholderTextColor={colors.gray[400]}
                autoFocus
              />
              <View style={styles.replyActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!replyText.trim() || isLoading) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendReply}
                  disabled={!replyText.trim() || isLoading}
                >
                  <Send size={16} color={colors.white} />
                  <Text style={styles.sendButtonText}>
                    {isLoading ? 'Posting...' : 'Reply'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.replyPrompt}
              onPress={() => setIsReplying(true)}
            >
              <Text style={styles.replyPromptText}>
                Write a reply...
              </Text>
              <MessageSquare size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {thread.isLocked && (
        <View style={styles.lockedNotice}>
          <Lock size={16} color={colors.gray[500]} />
          <Text style={styles.lockedNoticeText}>
            This thread is locked and cannot receive new replies
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  threadContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  threadHeader: {
    marginBottom: 16,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: colors.black,
    lineHeight: 28,
  },
  pinnedThreadTitle: {
    color: colors.primary,
  },
  threadMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
  },
  threadDate: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  threadStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  threadContent: {
    fontSize: 16,
    color: colors.gray[700],
    lineHeight: 24,
  },
  repliesSection: {
    flex: 1,
  },
  repliesHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.black,
  },
  noReplies: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noRepliesText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  noRepliesSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  repliesContainer: {
    padding: 16,
    gap: 12,
  },
  replyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  replyHeader: {
    marginBottom: 12,
  },
  replyAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  replyDate: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  replyContent: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: 12,
  },
  replyFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[50],
  },
  likedButton: {
    backgroundColor: colors.secondary + '20',
  },
  likeText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '500' as const,
  },
  likedText: {
    color: colors.secondary,
  },
  replyInputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: 16,
  },
  replyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyPromptText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  replyInputExpanded: {
    gap: 12,
  },
  replyInput: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.black,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: '500' as const,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600' as const,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: 16,
    gap: 8,
  },
  lockedNoticeText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
});