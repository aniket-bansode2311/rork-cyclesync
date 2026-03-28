import { AIInsight, UserDataSummary } from '@/types/insights';
import { requestQueue } from './requestQueue';

export class MockBackendService {
  private static baseUrl = 'https://api.cyclesync.com';
  private static lastRequestTime = 0;
  private static minRequestInterval = 1000; // 1 second between requests
  
  // Rate limiting helper
  private static async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  // Simulate data synchronization with backend
  static async syncUserData(dataSummary: UserDataSummary): Promise<{ success: boolean; syncId: string }> {
    return requestQueue.add(async () => {
      await this.waitForRateLimit();
      
      // Simulate API delay with jitter to prevent thundering herd
      const delay = 800 + Math.random() * 400;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log('📤 Syncing user data to backend:', {
        periods: dataSummary.periods.totalPeriods,
        symptoms: dataSummary.symptoms.commonSymptoms.length,
        moods: dataSummary.moods.commonMoods.length,
      });
      
      // Simulate occasional failures for testing
      if (Math.random() < 0.05) {
        throw new Error('Temporary sync failure');
      }
      
      return {
        success: true,
        syncId: `sync_${Date.now()}`,
      };
    });
  }
  
  // Simulate AI insight generation from backend
  static async generateAIInsights(dataSummary: UserDataSummary): Promise<AIInsight[]> {
    return requestQueue.add(async () => {
      await this.waitForRateLimit();
      
      // Simulate API delay with jitter
      const delay = 1200 + Math.random() * 600;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log('🤖 Generating AI insights from backend...');
      
      // Simulate occasional failures
      if (Math.random() < 0.03) {
        throw new Error('AI service temporarily unavailable');
      }
      
      return this.generateEnhancedInsights(dataSummary);
    });
  }
  
  // Enhanced rule-based insights (simulating AI-generated content)
  private static generateEnhancedInsights(dataSummary: UserDataSummary): AIInsight[] {
    const insights: AIInsight[] = [];
    const now = new Date().toISOString();
    
    // Advanced cycle pattern analysis
    if (dataSummary.periods.totalPeriods >= 3) {
      const cycleLength = dataSummary.periods.averageCycleLength;
      
      if (cycleLength >= 21 && cycleLength <= 35) {
        insights.push({
          id: `ai-cycle-${Date.now()}`,
          type: 'pattern',
          category: 'period',
          title: 'Healthy Cycle Pattern Detected',
          content: `Your cycle shows excellent regularity with an average length of ${cycleLength} days. This consistency indicates balanced hormones and good reproductive health. Keep maintaining your current lifestyle habits!`,
          confidence: 0.92,
          priority: 'low',
          source: 'ai',
          dataPoints: ['cycle-regularity', 'hormone-balance'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['cycle-regularity', 'hormonal-health', 'positive-feedback'],
        });
      }
    }
    
    // Symptom correlation analysis
    if (dataSummary.symptoms.commonSymptoms.length >= 2) {
      const topSymptoms = dataSummary.symptoms.commonSymptoms.slice(0, 2);
      const hasPhysicalSymptoms = topSymptoms.some(s => 
        s.name.toLowerCase().includes('cramp') || 
        s.name.toLowerCase().includes('headache') ||
        s.name.toLowerCase().includes('bloat')
      );
      
      if (hasPhysicalSymptoms) {
        insights.push({
          id: `ai-symptom-${Date.now()}`,
          type: 'recommendation',
          category: 'symptoms',
          title: 'Personalized Symptom Management',
          content: `Based on your symptom patterns, I recommend trying magnesium supplements (300-400mg daily) starting 10 days before your period. Studies show this can reduce cramping by up to 40%. Also consider gentle yoga or stretching during symptomatic days.`,
          confidence: 0.85,
          priority: 'medium',
          source: 'ai',
          dataPoints: ['symptom-frequency', 'evidence-based-treatment'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['magnesium', 'supplements', 'cramp-relief', 'evidence-based'],
        });
      }
    }
    
    // Mood and cycle correlation
    if (dataSummary.moods.commonMoods.length >= 1) {
      const dominantMood = dataSummary.moods.commonMoods[0];
      
      if (dominantMood.mood === 'anxious' || dominantMood.mood === 'irritable') {
        insights.push({
          id: `ai-mood-${Date.now()}`,
          type: 'correlation',
          category: 'mood',
          title: 'Cycle-Mood Connection Identified',
          content: `Your ${dominantMood.mood} feelings appear to correlate with your luteal phase (days 15-28 of your cycle). This is due to fluctuating progesterone levels. Try increasing omega-3 fatty acids and consider evening primrose oil to help stabilize mood naturally.`,
          confidence: 0.78,
          priority: 'medium',
          source: 'ai',
          dataPoints: ['mood-cycle-correlation', 'hormonal-influence'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['mood-correlation', 'luteal-phase', 'omega-3', 'natural-remedies'],
        });
      }
    }
    
    // Predictive insights
    if (dataSummary.periods.lastPeriodDate) {
      const lastPeriod = new Date(dataSummary.periods.lastPeriodDate);
      const daysSinceLastPeriod = Math.floor((new Date().getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      const expectedNextPeriod = daysSinceLastPeriod + (dataSummary.periods.averageCycleLength - daysSinceLastPeriod);
      
      if (expectedNextPeriod <= 7) {
        insights.push({
          id: `ai-prediction-${Date.now()}`,
          type: 'prediction',
          category: 'period',
          title: 'Period Prediction & Preparation',
          content: `Based on your cycle pattern, your next period is likely to start in ${expectedNextPeriod} days. Consider preparing by increasing iron-rich foods, staying hydrated, and having your preferred period products ready. Your body may start showing PMS symptoms in the next 2-3 days.`,
          confidence: 0.88,
          priority: 'high',
          source: 'ai',
          dataPoints: ['cycle-prediction', 'pattern-analysis'],
          generatedAt: now,
          expiresAt: new Date(Date.now() + (expectedNextPeriod + 2) * 24 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          isDismissed: false,
          tags: ['period-prediction', 'preparation', 'iron-rich-foods', 'pms'],
        });
      }
    }
    
    // Wellness optimization
    if (dataSummary.symptoms.commonSymptoms.length > 0 || dataSummary.moods.commonMoods.length > 0) {
      insights.push({
        id: `ai-wellness-${Date.now()}`,
        type: 'health_tip',
        category: 'wellness',
        title: 'Holistic Wellness Optimization',
        content: `Your tracking data suggests you could benefit from cycle syncing your lifestyle. During your follicular phase (days 1-14), focus on high-intensity workouts and new projects. During your luteal phase (days 15-28), prioritize gentle exercise, self-care, and complex carbohydrates to support stable energy and mood.`,
        confidence: 0.82,
        priority: 'medium',
        source: 'ai',
        dataPoints: ['cycle-syncing', 'lifestyle-optimization'],
        generatedAt: now,
        isRead: false,
        isDismissed: false,
        tags: ['cycle-syncing', 'lifestyle-optimization', 'follicular-phase', 'luteal-phase'],
      });
    }
    
    return insights.slice(0, 3); // Return top 3 insights
  }
  
  // Simulate feedback submission
  static async submitInsightFeedback(insightId: string, feedback: any): Promise<{ success: boolean }> {
    return requestQueue.add(async () => {
      await this.waitForRateLimit();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📝 Submitting insight feedback:', { insightId, feedback });
      
      return { success: true };
    });
  }
  
  // Simulate user consent for data sharing
  static async requestDataSharingConsent(): Promise<{ consentRequired: boolean; consentUrl?: string }> {
    return requestQueue.add(async () => {
      console.log('🔒 Checking data sharing consent...');
      
      // For demo purposes, assume consent is always given
      return {
        consentRequired: false,
      };
    });
  }
}