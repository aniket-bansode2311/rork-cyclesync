import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Brain,
  ThumbsUp,
  ThumbsDown,
  X,
  RefreshCw,
  Lightbulb,
  TrendingUp,
  Heart,
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { AIInsight, FeedbackType } from '@/types/insights';
import { useAIInsights } from '@/hooks/useAIInsights';

interface AIInsightsCardProps {
  onViewAll?: () => void;
}

export function AIInsightsCard({ onViewAll }: AIInsightsCardProps) {
  const {
    insights,
    isLoading,
    isGenerating,
    generateInsights,
    markAsRead,
    submitFeedback,
    dismissInsight,
    markActionTaken,
  } = useAIInsights();

  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);

  const unreadInsights = insights.filter(insight => !insight.isRead);
  const displayInsights = unreadInsights.slice(0, 2); // Show max 2 insights on home screen

  const getInsightIcon = (insight: AIInsight) => {
    switch (insight.type) {
      case 'pattern':
        return <TrendingUp size={16} color={colors.primary} />;
      case 'prediction':
        return <Brain size={16} color={colors.primary} />;
      case 'recommendation':
        return <Lightbulb size={16} color={colors.primary} />;
      case 'correlation':
        return <Heart size={16} color={colors.primary} />;
      case 'health_tip':
        return <BookOpen size={16} color={colors.primary} />;
      case 'alert':
        return <AlertCircle size={16} color={colors.error} />;
      case 'achievement':
        return <CheckCircle size={16} color={colors.success} />;
      default:
        return <AlertCircle size={16} color={colors.primary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.gray[500];
      default:
        return colors.primary;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai':
        return <Brain size={12} color={colors.primary} />;
      case 'rule_based':
        return <Zap size={12} color={colors.gray[500]} />;
      default:
        return <Clock size={12} color={colors.gray[400]} />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.gray[500];
  };

  const handleFeedback = async (insightId: string, type: FeedbackType) => {
    setFeedbackLoading(insightId);
    try {
      await submitFeedback({
        insightId,
        type,
        submittedAt: new Date().toISOString(),
      });
      
      // Mark as read when feedback is submitted
      await markAsRead(insightId);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(null);
    }
  };

  const handleDismiss = (insightId: string) => {
    Alert.alert(
      'Dismiss Insight',
      'Are you sure you want to dismiss this insight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => dismissInsight(insightId),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={20} color={colors.primary} />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </View>
    );
  }

  if (displayInsights.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={20} color={colors.primary} />
          <Text style={styles.title}>AI Insights</Text>
          <TouchableOpacity
            onPress={() => generateInsights()}
            disabled={isGenerating}
            style={styles.refreshButton}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isGenerating
              ? 'Generating personalized insights...'
              : 'Keep tracking your cycle to get personalized insights!'}
          </Text>
          {!isGenerating && (
            <TouchableOpacity
              onPress={() => generateInsights()}
              style={styles.generateButton}
            >
              <Text style={styles.generateButtonText}>Generate Insights</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={20} color={colors.primary} />
        <Text style={styles.title}>AI Insights</Text>
        <View style={styles.headerActions}>
          {unreadInsights.length > 2 && (
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All ({unreadInsights.length})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => generateInsights()}
            disabled={isGenerating}
            style={styles.refreshButton}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {displayInsights.map((insight) => (
        <View key={insight.id} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightTitleRow}>
              {getInsightIcon(insight)}
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <View style={styles.insightBadges}>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(insight.priority) }
                ]}>
                  <Text style={styles.priorityText}>{insight.priority}</Text>
                </View>
                {insight.source === 'ai' && (
                  <View style={styles.aiBadge}>
                    {getSourceIcon(insight.source)}
                    <Text style={styles.aiText}>AI</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDismiss(insight.id)}
                style={styles.dismissButton}
              >
                <X size={16} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <View style={styles.metaContainer}>
              <View style={styles.confidenceContainer}>
                <View
                  style={[
                    styles.confidenceDot,
                    { backgroundColor: getConfidenceColor(insight.confidence) },
                  ]}
                />
                <Text style={styles.confidenceText}>
                  {Math.round(insight.confidence * 100)}% confidence
                </Text>
              </View>
              {insight.expiresAt && (
                <View style={styles.expiryContainer}>
                  <Clock size={10} color={colors.gray[500]} />
                  <Text style={styles.expiryText}>
                    Expires {new Date(insight.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.insightContent}>{insight.content}</Text>

          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackLabel}>Was this helpful?</Text>
              {insight.type === 'recommendation' && (
                <TouchableOpacity
                  onPress={() => markActionTaken(insight.id)}
                  disabled={insight.actionTaken}
                  style={[
                    styles.actionButton,
                    insight.actionTaken && styles.actionButtonTaken
                  ]}
                >
                  <CheckCircle 
                    size={12} 
                    color={insight.actionTaken ? colors.white : colors.success} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    insight.actionTaken && styles.actionButtonTextTaken
                  ]}>
                    {insight.actionTaken ? 'Done!' : 'Mark as Done'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                onPress={() => handleFeedback(insight.id, 'very_helpful')}
                disabled={feedbackLoading === insight.id || !!insight.feedback}
                style={[
                  styles.feedbackButton,
                  insight.feedback?.type === 'very_helpful' && styles.feedbackButtonActive,
                ]}
              >
                {feedbackLoading === insight.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <ThumbsUp
                      size={14}
                      color={
                        insight.feedback?.type === 'very_helpful'
                          ? colors.white
                          : colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.feedbackButtonText,
                        insight.feedback?.type === 'very_helpful' &&
                          styles.feedbackButtonTextActive,
                      ]}
                    >
                      Very
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFeedback(insight.id, 'helpful')}
                disabled={feedbackLoading === insight.id || !!insight.feedback}
                style={[
                  styles.feedbackButton,
                  insight.feedback?.type === 'helpful' && styles.feedbackButtonActive,
                ]}
              >
                {feedbackLoading === insight.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <ThumbsUp
                      size={14}
                      color={
                        insight.feedback?.type === 'helpful'
                          ? colors.white
                          : colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.feedbackButtonText,
                        insight.feedback?.type === 'helpful' &&
                          styles.feedbackButtonTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleFeedback(insight.id, 'not_helpful')}
                disabled={feedbackLoading === insight.id || !!insight.feedback}
                style={[
                  styles.feedbackButton,
                  insight.feedback?.type === 'not_helpful' && styles.feedbackButtonActive,
                ]}
              >
                {feedbackLoading === insight.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <ThumbsDown
                      size={14}
                      color={
                        insight.feedback?.type === 'not_helpful'
                          ? colors.white
                          : colors.gray[500]
                      }
                    />
                    <Text
                      style={[
                        styles.feedbackButtonText,
                        insight.feedback?.type === 'not_helpful' &&
                          styles.feedbackButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {insight.feedback && (
            <View style={styles.feedbackSubmitted}>
              <Text style={styles.feedbackSubmittedText}>
                Thank you for your feedback!
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.gray[600],
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: colors.gray[600],
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  insightHeader: {
    marginBottom: 8,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 6,
    flex: 1,
  },
  insightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: colors.primary + '20',
    borderRadius: 6,
    gap: 2,
  },
  aiText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.primary,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expiryText: {
    fontSize: 10,
    color: colors.gray[500],
  },
  dismissButton: {
    padding: 2,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    fontSize: 11,
    color: colors.gray[600],
  },
  insightContent: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  feedbackLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.white,
    gap: 3,
  },
  actionButtonTaken: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  actionButtonText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '500',
  },
  actionButtonTextTaken: {
    color: colors.white,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 3,
  },
  feedbackButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feedbackButtonText: {
    fontSize: 11,
    color: colors.gray[700],
    fontWeight: '500',
  },
  feedbackButtonTextActive: {
    color: colors.white,
  },
  feedbackSubmitted: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feedbackSubmittedText: {
    fontSize: 11,
    color: colors.success,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});