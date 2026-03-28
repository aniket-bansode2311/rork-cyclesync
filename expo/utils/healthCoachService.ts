import { ConversationContext, HealthCoachResponse } from '@/types/healthCoach';

export class HealthCoachService {
  private static instance: HealthCoachService;

  static getInstance(): HealthCoachService {
    if (!HealthCoachService.instance) {
      HealthCoachService.instance = new HealthCoachService();
    }
    return HealthCoachService.instance;
  }

  async generateResponse(
    message: string,
    context: ConversationContext
  ): Promise<HealthCoachResponse> {
    const lowerMessage = message.toLowerCase();

    // Period-related queries
    if (this.containsKeywords(lowerMessage, ['next period', 'when period', 'period due'])) {
      return this.handleNextPeriodQuery(context);
    }

    if (this.containsKeywords(lowerMessage, ['pms', 'pms symptoms', 'premenstrual'])) {
      return this.handlePMSQuery();
    }

    if (this.containsKeywords(lowerMessage, ['cramps', 'period pain', 'menstrual pain'])) {
      return this.handleCrampsQuery();
    }

    if (this.containsKeywords(lowerMessage, ['cycle length', 'normal cycle', 'how long'])) {
      return this.handleCycleLengthQuery();
    }

    if (this.containsKeywords(lowerMessage, ['mood swings', 'emotional', 'irritable', 'anxious'])) {
      return this.handleMoodQuery();
    }

    if (this.containsKeywords(lowerMessage, ['track cycle', 'tracking', 'how to track'])) {
      return this.handleTrackingQuery();
    }

    if (this.containsKeywords(lowerMessage, ['nutrition', 'food', 'eat', 'diet'])) {
      return this.handleNutritionQuery();
    }

    if (this.containsKeywords(lowerMessage, ['exercise', 'workout', 'fitness'])) {
      return this.handleExerciseQuery();
    }

    // Default response
    return this.handleGeneralQuery();
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private handleNextPeriodQuery(context: ConversationContext): HealthCoachResponse {
    if (context.nextPeriodDate) {
      const daysUntil = Math.ceil(
        (context.nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntil <= 0) {
        return {
          message: "Your period might be starting soon or may have already begun. Don't forget to log it in your cycle tracker!",
          suggestions: ["Log your period start date", "Track any symptoms you're experiencing"],
          followUpQuestions: ["Are you experiencing any period symptoms?", "Would you like tips for period comfort?"]
        };
      } else if (daysUntil <= 3) {
        return {
          message: `Your next period is predicted to start in about ${daysUntil} day${daysUntil > 1 ? 's' : ''}. You might start experiencing PMS symptoms soon.`,
          suggestions: ["Prepare period supplies", "Consider tracking pre-period symptoms"],
          followUpQuestions: ["Are you experiencing any PMS symptoms?", "Would you like tips for PMS management?"]
        };
      } else {
        return {
          message: `Based on your cycle data, your next period is predicted to start in about ${daysUntil} days.`,
          suggestions: ["Continue tracking your cycle", "Log any symptoms you experience"],
          followUpQuestions: ["How are you feeling in your current cycle phase?", "Any symptoms to track today?"]
        };
      }
    }

    return {
      message: "I'd need more information about your recent cycles to predict your next period. Have you been tracking your periods regularly?",
      suggestions: ["Start logging your periods", "Track cycle symptoms"],
      followUpQuestions: ["When was your last period?", "What's your typical cycle length?"]
    };
  }

  private handlePMSQuery(): HealthCoachResponse {
    return {
      message: "Common PMS symptoms include mood changes, bloating, breast tenderness, fatigue, irritability, and food cravings. These typically occur 1-2 weeks before your period.",
      suggestions: ["Track your symptoms", "Try relaxation techniques", "Maintain a healthy diet"],
      followUpQuestions: ["Which PMS symptoms affect you most?", "Would you like tips for managing specific symptoms?"]
    };
  }

  private handleCrampsQuery(): HealthCoachResponse {
    return {
      message: "For menstrual cramps, try applying heat to your lower abdomen, gentle exercise like walking or yoga, staying hydrated, and getting adequate rest. Anti-inflammatory foods like leafy greens and berries may also help.",
      suggestions: ["Use a heating pad", "Try gentle stretching", "Stay hydrated", "Consider magnesium-rich foods"],
      followUpQuestions: ["How severe are your cramps usually?", "Have you tried any natural remedies before?"]
    };
  }

  private handleCycleLengthQuery(): HealthCoachResponse {
    return {
      message: "A normal menstrual cycle typically ranges from 21 to 35 days, with 28 days being average. Your cycle length is measured from the first day of one period to the first day of the next.",
      suggestions: ["Track your cycles for 3-6 months", "Note any irregularities", "Consult a healthcare provider if concerned"],
      followUpQuestions: ["What's your typical cycle length?", "Have you noticed any changes in your cycle recently?"]
    };
  }

  private handleMoodQuery(): HealthCoachResponse {
    return {
      message: "Mood changes during your cycle are normal due to hormonal fluctuations. Try regular exercise, adequate sleep, stress management techniques like meditation, and maintaining stable blood sugar with balanced meals.",
      suggestions: ["Practice mindfulness", "Maintain regular sleep schedule", "Try gentle exercise", "Eat balanced meals"],
      followUpQuestions: ["When do you typically experience mood changes?", "What helps you feel better during difficult days?"]
    };
  }

  private handleTrackingQuery(): HealthCoachResponse {
    return {
      message: "To track your cycle effectively, log your period start and end dates, note flow intensity, track symptoms like cramps or mood changes, and record any other relevant health information daily.",
      suggestions: ["Set daily tracking reminders", "Use the cycle calendar", "Log symptoms consistently", "Track additional health metrics"],
      followUpQuestions: ["What aspects of your cycle would you like to track?", "Do you need help setting up tracking reminders?"]
    };
  }

  private handleNutritionQuery(): HealthCoachResponse {
    return {
      message: "During your cycle, focus on iron-rich foods (leafy greens, lean meats), calcium sources (dairy, almonds), complex carbs for energy, and anti-inflammatory foods like berries and fatty fish. Stay hydrated and limit caffeine and processed foods.",
      suggestions: ["Eat iron-rich foods", "Include complex carbohydrates", "Stay hydrated", "Try anti-inflammatory foods"],
      followUpQuestions: ["Are you experiencing any specific symptoms you'd like to address with nutrition?", "Do you have any dietary restrictions I should know about?"]
    };
  }

  private handleExerciseQuery(): HealthCoachResponse {
    return {
      message: "Regular exercise can help with menstrual symptoms. During your period, try gentle activities like walking, yoga, or swimming. Throughout your cycle, aim for a mix of cardio and strength training based on your energy levels.",
      suggestions: ["Try gentle yoga", "Go for walks", "Listen to your body", "Adjust intensity based on cycle phase"],
      followUpQuestions: ["What types of exercise do you enjoy?", "How does exercise affect your menstrual symptoms?"]
    };
  }

  private handleGeneralQuery(): HealthCoachResponse {
    return {
      message: "I'm here to help with questions about your menstrual cycle, symptoms, and general reproductive health. Feel free to ask about periods, PMS, nutrition, exercise, or cycle tracking!",
      suggestions: ["Ask about period predictions", "Learn about PMS management", "Get nutrition tips", "Explore cycle tracking features"],
      followUpQuestions: ["What would you like to know about your cycle?", "Are you experiencing any specific symptoms?"]
    };
  }
}