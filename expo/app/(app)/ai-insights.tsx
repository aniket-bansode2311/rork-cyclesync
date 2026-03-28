import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
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
  Filter,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { AIInsight, FeedbackType, InsightType, InsightCategory } from '@/types/insights';
import { useAIInsights } from '@/hooks/useAIInsights';

export default function AIInsightsScreen() {
  const {
    insights,
    isLoading,
    isGenerating,
    generateInsights,
    markAsRead,
    submitFeedback,
    dismissInsight,
    refreshInsights,
    markActionTaken,
    getInsightsByCategory,
    getInsightsByPriority,
    searchInsights,
    getInsightAnalytics,
  } = useAIInsights();

  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<InsightType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<InsightCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

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
      default:
        return <AlertCircle size={16} color={colors.primary} />;
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshInsights();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (filterType !== 'all' && insight.type !== filterType) return false;
    if (filterCategory !== 'all' && insight.category !== filterCategory) return false;
    if (searchQuery && !searchInsights(searchQuery).some(s => s.id === insight.id)) return false;
    return true;
  });

  const analytics = getInsightAnalytics();
  const priorityInsights = getInsightsByPriority('high').concat(getInsightsByPriority('urgent'));

  const unreadCount = insights.filter(insight => !insight.isRead).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: `AI Insights ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => generateInsights()}
              disabled={isGenerating}
              style={styles.headerButton}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshCw size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.container}>
        {/* Analytics Summary */}
        {priorityInsights.length > 0 && (
          <View style={styles.priorityBanner}>
            <AlertCircle size={16} color={colors.warning} />
            <Text style={styles.priorityText}>
              {priorityInsights.length} high priority insight{priorityInsights.length > 1 ? 's' : ''} need{priorityInsights.length === 1 ? 's' : ''} attention
            </Text>
          </View>
        )}

        {/* Quick Analytics */}
        <TouchableOpacity 
          style={styles.analyticsCard}
          onPress={() => setShowAnalytics(!showAnalytics)}
        >
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>Insights Overview</Text>
            <Text style={styles.analyticsToggle}>{showAnalytics ? 'Hide' : 'Show'}</Text>
          </View>
          {showAnalytics && (
            <View style={styles.analyticsContent}>
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsStat}>
                  <Text style={styles.analyticsNumber}>{analytics.totalInsights}</Text>
                  <Text style={styles.analyticsLabel}>Total</Text>
                </View>
                <View style={styles.analyticsStat}>
                  <Text style={styles.analyticsNumber}>{analytics.readInsights}</Text>
                  <Text style={styles.analyticsLabel}>Read</Text>
                </View>
                <View style={styles.analyticsStat}>
                  <Text style={styles.analyticsNumber}>{analytics.actionTakenCount}</Text>
                  <Text style={styles.analyticsLabel}>Actions</Text>
                </View>
                <View style={styles.analyticsStat}>
                  <Text style={styles.analyticsNumber}>{Math.round(analytics.averageConfidence * 100)}%</Text>
                  <Text style={styles.analyticsLabel}>Confidence</Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setFilterType('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All Types
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === 'pattern' && styles.filterChipActive,
                ]}
                onPress={() => setFilterType('pattern')}
              >
                <TrendingUp size={14} color={filterType === 'pattern' ? colors.white : colors.primary} />
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'pattern' && styles.filterChipTextActive,
                  ]}
                >
                  Patterns
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === 'recommendation' && styles.filterChipActive,
                ]}
                onPress={() => setFilterType('recommendation')}
              >
                <Lightbulb size={14} color={filterType === 'recommendation' ? colors.white : colors.primary} />
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'recommendation' && styles.filterChipTextActive,
                  ]}
                >
                  Tips
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === 'prediction' && styles.filterChipActive,
                ]}
                onPress={() => setFilterType('prediction')}
              >
                <Brain size={14} color={filterType === 'prediction' ? colors.white : colors.primary} />
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'prediction' && styles.filterChipTextActive,
                  ]}
                >
                  Predictions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === 'alert' && styles.filterChipActive,
                ]}
                onPress={() => setFilterType('alert')}
              >
                <AlertCircle size={14} color={filterType === 'alert' ? colors.white : colors.error} />
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === 'alert' && styles.filterChipTextActive,
                  ]}
                >
                  Alerts
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading insights...</Text>
            </View>
          ) : filteredInsights.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Brain size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Insights Yet</Text>
              <Text style={styles.emptyText}>
                {insights.length === 0
                  ? 'Keep tracking your cycle and symptoms to get personalized AI insights!'
                  : 'No insights match your current filters.'}
              </Text>
              {insights.length === 0 && (
                <TouchableOpacity
                  onPress={() => generateInsights()}
                  disabled={isGenerating}
                  style={styles.generateButton}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.generateButtonText}>Generate Insights</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.insightsContainer}>
              {filteredInsights.map((insight) => (
                <View
                  key={insight.id}
                  style={[
                    styles.insightCard,
                    !insight.isRead && styles.insightCardUnread,
                  ]}
                >
                  <View style={styles.insightHeader}>
                    <View style={styles.insightTitleRow}>
                      {getInsightIcon(insight)}
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleDismiss(insight.id)}
                        style={styles.dismissButton}
                      >
                        <X size={16} color={colors.gray[500]} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.insightMeta}>
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
                      
                      <Text style={styles.insightDate}>
                        {new Date(insight.generatedAt).toLocaleDateString()}
                      </Text>
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
                          <Text style={[
                            styles.actionButtonText,
                            insight.actionTaken && styles.actionButtonTextTaken
                          ]}>
                            {insight.actionTaken ? '✓ Done' : 'Mark as Done'}
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
                              Very Helpful
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
                              Helpful
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
                              Not Helpful
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
          )}
        </ScrollView>
      </View>
    </>
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
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.gray[700],
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.gray[600],
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContainer: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightHeader: {
    marginBottom: 12,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
  insightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  insightDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  insightContent: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 16,
  },
  priorityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  priorityText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  analyticsCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  analyticsToggle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  analyticsContent: {
    marginTop: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsStat: {
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  analyticsLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackLabel: {
    fontSize: 13,
    color: colors.gray[600],
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.white,
  },
  actionButtonTaken: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  actionButtonTextTaken: {
    color: colors.white,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  feedbackButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feedbackButtonText: {
    fontSize: 12,
    color: colors.gray[700],
    fontWeight: '500',
  },
  feedbackButtonTextActive: {
    color: colors.white,
  },
  feedbackSubmitted: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feedbackSubmittedText: {
    fontSize: 12,
    color: colors.success,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});