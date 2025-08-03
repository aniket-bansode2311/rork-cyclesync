import { AIInsight, UserDataSummary, InsightType, InsightCategory } from '@/types/insights';
import { Period } from '@/types/period';
import { LoggedSymptom, LoggedMood } from '@/types/symptoms';
import { MockBackendService } from './mockBackendService';
import { Platform } from 'react-native';

// Placeholder backend service URL - in production this would be your actual AI service
const AI_SERVICE_URL = 'https://api.cyclesync.com/ai/insights';

export class AIInsightsService {
  // Generate user data summary for AI processing
  static generateUserDataSummary(
    periods: Period[],
    symptoms: LoggedSymptom[],
    moods: LoggedMood[]
  ): UserDataSummary {
    // Calculate period statistics
    const averageCycleLength = periods.length > 1 
      ? periods.slice(1).reduce((sum, period, index) => {
          const prevPeriod = periods[index];
          const cycleLength = new Date(period.startDate).getTime() - new Date(prevPeriod.startDate).getTime();
          return sum + (cycleLength / (1000 * 60 * 60 * 24));
        }, 0) / (periods.length - 1)
      : 28;

    const lastPeriodDate = periods.length > 0 ? periods[periods.length - 1].startDate : undefined;

    // Calculate symptom statistics
    const symptomFrequency = symptoms.reduce((acc, symptom) => {
      acc[symptom.symptomName] = (acc[symptom.symptomName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonSymptoms = Object.entries(symptomFrequency)
      .map(([name, frequency]) => {
        const symptomInstances = symptoms.filter(s => s.symptomName === name);
        const averageIntensity = symptomInstances.reduce((sum, s) => {
          const intensityValue = s.intensity === 'mild' ? 1 : s.intensity === 'moderate' ? 2 : 3;
          return sum + intensityValue;
        }, 0) / symptomInstances.length;
        
        return { name, frequency, averageIntensity };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const recentSymptoms = symptoms
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(s => ({ name: s.symptomName, date: s.date, intensity: s.intensity }));

    // Calculate mood statistics
    const moodFrequency = moods.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonMoods = Object.entries(moodFrequency)
      .map(([mood, frequency]) => {
        const moodInstances = moods.filter(m => m.mood === mood);
        const averageIntensity = moodInstances.reduce((sum, m) => sum + m.intensity, 0) / moodInstances.length;
        
        return { mood, frequency, averageIntensity };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const recentMoods = moods
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(m => ({ mood: m.mood, date: m.date, intensity: m.intensity }));

    return {
      periods: {
        averageCycleLength: Math.round(averageCycleLength),
        lastPeriodDate,
        totalPeriods: periods.length,
        cycleVariability: periods.length > 2 ? Math.round(Math.abs(averageCycleLength - 28)) : 0,
        predictedNextPeriod: lastPeriodDate ? new Date(new Date(lastPeriodDate).getTime() + averageCycleLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      },
      symptoms: {
        commonSymptoms: commonSymptoms.map(s => ({
          ...s,
          trend: 'stable' as const
        })),
        recentSymptoms,
        symptomPatterns: [],
      },
      moods: {
        commonMoods: commonMoods.map(m => ({
          ...m,
          trend: 'stable' as const
        })),
        recentMoods,
        moodPatterns: [],
      },
    };
  }

  // Rule-based insight generation (placeholder for AI service)
  static generateRuleBasedInsights(dataSummary: UserDataSummary): AIInsight[] {
    const insights: AIInsight[] = [];
    const now = new Date().toISOString();

    // Pattern insights for symptoms
    if (dataSummary.symptoms.commonSymptoms.length > 0) {
      const topSymptom = dataSummary.symptoms.commonSymptoms[0];
      
      if (topSymptom.name.toLowerCase().includes('cramp') && topSymptom.frequency >= 3) {
        insights.push({
          id: `insight-cramps-${Date.now()}`,
          type: 'pattern',
          category: 'symptoms',
          title: 'Recurring Cramp Pattern Detected',
          content: `We've noticed you often experience ${topSymptom.name.toLowerCase()} (${topSymptom.frequency} times recently). This is common before and during periods. Consider trying a warm bath, gentle exercise, or over-the-counter pain relief to find comfort.`,
          confidence: 0.8,
          priority: 'medium',
          source: 'rule_based',
          dataPoints: [`symptom-frequency-${topSymptom.name}`],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['cramps', 'pain-management', 'menstrual-symptoms'],
        });
      }

      if (topSymptom.name.toLowerCase().includes('headache') && topSymptom.frequency >= 2) {
        insights.push({
          id: `insight-headache-${Date.now()}`,
          type: 'recommendation',
          category: 'symptoms',
          title: 'Headache Management Tips',
          content: `You've logged headaches ${topSymptom.frequency} times recently. Hormonal changes during your cycle can trigger headaches. Stay hydrated, maintain regular sleep, and consider tracking potential triggers like stress or certain foods.`,
          confidence: 0.7,
          priority: 'medium',
          source: 'rule_based',
          dataPoints: [`symptom-frequency-${topSymptom.name}`],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['headaches', 'hormonal-triggers', 'hydration'],
        });
      }
    }

    // Mood pattern insights
    if (dataSummary.moods.commonMoods.length > 0) {
      const topMood = dataSummary.moods.commonMoods[0];
      
      if (topMood.mood === 'anxious' && topMood.frequency >= 3) {
        insights.push({
          id: `insight-anxiety-${Date.now()}`,
          type: 'recommendation',
          category: 'mood',
          title: 'Managing Cycle-Related Anxiety',
          content: `You've been feeling anxious frequently (${topMood.frequency} times recently). Hormonal fluctuations can affect mood. Try deep breathing exercises, mindfulness meditation, or gentle yoga. If anxiety persists, consider speaking with a healthcare provider.`,
          confidence: 0.75,
          priority: 'high',
          source: 'rule_based',
          dataPoints: [`mood-frequency-${topMood.mood}`],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['anxiety', 'mental-health', 'mindfulness', 'hormonal-changes'],
        });
      }

      if (topMood.mood === 'irritable' && topMood.frequency >= 2) {
        insights.push({
          id: `insight-irritability-${Date.now()}`,
          type: 'health_tip',
          category: 'mood',
          title: 'Understanding Cycle-Related Irritability',
          content: `Feeling irritable is common during certain phases of your cycle. Regular exercise, adequate sleep, and maintaining stable blood sugar levels through balanced meals can help manage these feelings.`,
          confidence: 0.7,
          priority: 'medium',
          source: 'rule_based',
          dataPoints: [`mood-frequency-${topMood.mood}`],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['irritability', 'mood-management', 'lifestyle', 'nutrition'],
        });
      }
    }

    // Cycle length insights
    if (dataSummary.periods.totalPeriods >= 3) {
      if (dataSummary.periods.averageCycleLength < 21) {
        insights.push({
          id: `insight-short-cycle-${Date.now()}`,
          type: 'prediction',
          category: 'period',
          title: 'Short Cycle Pattern Noticed',
          content: `Your average cycle length is ${dataSummary.periods.averageCycleLength} days, which is shorter than typical (21-35 days). While this can be normal for some people, consider tracking for a few more cycles and discussing with your healthcare provider if you have concerns.`,
          confidence: 0.8,
          priority: 'high',
          source: 'rule_based',
          dataPoints: ['cycle-length-average'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['cycle-length', 'short-cycles', 'healthcare-consultation'],
        });
      } else if (dataSummary.periods.averageCycleLength > 35) {
        insights.push({
          id: `insight-long-cycle-${Date.now()}`,
          type: 'prediction',
          category: 'period',
          title: 'Longer Cycle Pattern Observed',
          content: `Your average cycle length is ${dataSummary.periods.averageCycleLength} days. While cycles can vary, consistently longer cycles might be worth discussing with a healthcare provider, especially if this is a change from your normal pattern.`,
          confidence: 0.8,
          priority: 'high',
          source: 'rule_based',
          dataPoints: ['cycle-length-average'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['cycle-length', 'long-cycles', 'healthcare-consultation'],
        });
      } else {
        insights.push({
          id: `insight-regular-cycle-${Date.now()}`,
          type: 'health_tip',
          category: 'period',
          title: 'Healthy Cycle Pattern',
          content: `Great news! Your average cycle length of ${dataSummary.periods.averageCycleLength} days falls within the typical range. This regularity suggests your hormonal balance is healthy. Keep up with your tracking!`,
          confidence: 0.9,
          priority: 'low',
          source: 'rule_based',
          dataPoints: ['cycle-length-average'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['healthy-cycle', 'regular-periods', 'hormonal-balance'],
        });
      }
    }

    // Correlation insights
    if (dataSummary.symptoms.commonSymptoms.length >= 2 && dataSummary.moods.commonMoods.length >= 1) {
      const hasPhysicalSymptoms = dataSummary.symptoms.commonSymptoms.some(s => 
        s.name.toLowerCase().includes('cramp') || s.name.toLowerCase().includes('bloat')
      );
      const hasEmotionalChanges = dataSummary.moods.commonMoods.some(m => 
        m.mood === 'irritable' || m.mood === 'anxious'
      );

      if (hasPhysicalSymptoms && hasEmotionalChanges) {
        insights.push({
          id: `insight-correlation-${Date.now()}`,
          type: 'correlation',
          category: 'general',
          title: 'Mind-Body Connection Observed',
          content: `We've noticed you experience both physical symptoms and mood changes around your cycle. This mind-body connection is completely normal. Managing physical discomfort through heat therapy, gentle movement, and stress reduction can help with both physical and emotional symptoms.`,
          confidence: 0.7,
          priority: 'medium',
          source: 'rule_based',
          dataPoints: ['symptom-mood-correlation'],
          generatedAt: now,
          isRead: false,
          isDismissed: false,
          tags: ['mind-body-connection', 'holistic-health', 'stress-management'],
        });
      }
    }

    // General wellness tips
    if (insights.length === 0) {
      insights.push({
        id: `insight-general-${Date.now()}`,
        type: 'health_tip',
        category: 'wellness',
        title: 'Keep Up the Great Tracking!',
        content: `You're doing an excellent job tracking your cycle and symptoms. This data helps you understand your body's patterns and can be valuable information to share with healthcare providers. Consider adding notes about sleep, stress levels, and exercise to get even more insights.`,
        confidence: 0.6,
        priority: 'low',
        source: 'rule_based',
        dataPoints: ['general-tracking'],
        generatedAt: now,
        isRead: false,
        isDismissed: false,
        tags: ['tracking-encouragement', 'data-collection', 'healthcare-communication'],
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights at a time
  }

  // Generate insights using real AI service
  static async generateAIInsights(dataSummary: UserDataSummary): Promise<AIInsight[]> {
    try {
      const prompt = this.buildInsightPrompt(dataSummary);
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a women\'s health AI assistant specializing in menstrual cycle insights. Provide personalized, evidence-based insights in JSON format. Be supportive, informative, and medically accurate. Always recommend consulting healthcare providers for serious concerns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      const aiInsights = this.parseAIResponse(data.completion);
      
      if (aiInsights.length > 0) {
        console.log('🤖 Generated AI insights:', aiInsights.length);
        return aiInsights;
      }
      
      // Fallback to rule-based if AI parsing fails
      return this.generateRuleBasedInsights(dataSummary);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to rule-based insights
      return this.generateRuleBasedInsights(dataSummary);
    }
  }

  // Build comprehensive prompt for AI insight generation
  private static buildInsightPrompt(dataSummary: UserDataSummary): string {
    const { periods, symptoms, moods } = dataSummary;
    
    return `
Analyze this menstrual cycle data and provide 2-3 personalized insights in JSON format:

**Cycle Data:**
- Average cycle length: ${periods.averageCycleLength} days
- Total periods tracked: ${periods.totalPeriods}
- Last period: ${periods.lastPeriodDate || 'Not available'}

**Common Symptoms:**
${symptoms.commonSymptoms.map(s => `- ${s.name}: ${s.frequency} times, avg intensity ${s.averageIntensity.toFixed(1)}`).join('\n')}

**Recent Symptoms:**
${symptoms.recentSymptoms.slice(0, 5).map(s => `- ${s.date}: ${s.name} (${s.intensity})`).join('\n')}

**Common Moods:**
${moods.commonMoods.map(m => `- ${m.mood}: ${m.frequency} times, avg intensity ${m.averageIntensity.toFixed(1)}`).join('\n')}

**Recent Moods:**
${moods.recentMoods.slice(0, 5).map(m => `- ${m.date}: ${m.mood} (intensity ${m.intensity})`).join('\n')}

Provide insights as a JSON array with this exact structure:
[
  {
    "type": "pattern|prediction|recommendation|correlation|health_tip|alert",
    "category": "period|symptoms|mood|fertility|wellness|general|nutrition|sleep|activity",
    "title": "Clear, engaging title",
    "content": "Detailed, personalized insight with actionable advice",
    "confidence": 0.85,
    "priority": "low|medium|high|urgent",
    "dataPoints": ["relevant-data-references"],
    "tags": ["relevant", "searchable", "tags"]
  }
]

Focus on:
1. Identifying meaningful patterns
2. Providing actionable recommendations
3. Explaining correlations between symptoms/moods and cycle phases
4. Offering evidence-based health tips
5. Being supportive and encouraging

Return only the JSON array, no additional text.`;
  }

  // Parse AI response and convert to AIInsight objects
  private static parseAIResponse(aiResponse: string): AIInsight[] {
    try {
      // Clean the response to extract JSON
      let jsonStr = aiResponse.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array in the response
      const jsonMatch = jsonStr.match(/\[.*\]/s);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsedInsights = JSON.parse(jsonStr);
      const now = new Date().toISOString();
      
      return parsedInsights.map((insight: any, index: number) => ({
        id: `ai-insight-${Date.now()}-${index}`,
        type: insight.type || 'health_tip',
        category: insight.category || 'general',
        title: insight.title || 'Health Insight',
        content: insight.content || 'Keep tracking your cycle for personalized insights.',
        confidence: Math.min(Math.max(insight.confidence || 0.7, 0.1), 1.0),
        priority: insight.priority || 'medium',
        source: 'ai',
        dataPoints: Array.isArray(insight.dataPoints) ? insight.dataPoints : ['ai-generated'],
        generatedAt: now,
        isRead: false,
        isDismissed: false,
        tags: insight.tags || ['ai-generated'],
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  // Generate insights using backend AI service (with fallback)
  static async generateInsights(dataSummary: UserDataSummary, useBackend: boolean = true): Promise<AIInsight[]> {
    try {
      // Check for data sharing consent
      const consentCheck = await MockBackendService.requestDataSharingConsent();
      
      if (consentCheck.consentRequired) {
        console.log('⚠️ User consent required for AI processing');
        useBackend = false;
      }

      // Try AI-powered insights first
      if (useBackend && Platform.OS !== 'web') {
        try {
          const aiInsights = await this.generateAIInsights(dataSummary);
          if (aiInsights.length > 0) {
            return aiInsights;
          }
        } catch (error) {
          console.log('AI insights failed, trying backend mock service...');
        }
        
        // Fallback to enhanced mock backend
        try {
          const syncResult = await MockBackendService.syncUserData(dataSummary);
          console.log('✅ Data synced:', syncResult.syncId);
          
          const backendInsights = await MockBackendService.generateAIInsights(dataSummary);
          if (backendInsights.length > 0) {
            return backendInsights;
          }
        } catch (error) {
          console.log('Backend mock service failed, using local insights...');
        }
      }
      
      // Fallback to local rule-based insights
      console.log('📱 Using local insight generation');
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.generateRuleBasedInsights(dataSummary);
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateRuleBasedInsights(dataSummary);
    }
  }

  // Submit feedback to backend
  static async submitFeedback(insightId: string, feedback: any): Promise<void> {
    try {
      const result = await MockBackendService.submitInsightFeedback(insightId, feedback);
      if (!result.success) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
}