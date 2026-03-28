import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { ChatMessage, ConversationContext, QUICK_QUESTIONS } from '@/types/healthCoach';
import { HealthCoachService } from '@/utils/healthCoachService';
import { usePeriods } from './usePeriods';
import { useSymptoms } from './useSymptoms';
import { calculateCycleStats, getDaysUntilNextPeriod } from '@/utils/periodCalculations';

export const [HealthCoachProvider, useHealthCoach] = createContextHook(() => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your Virtual Health Coach. I'm here to help answer questions about your menstrual cycle, symptoms, and reproductive health. How can I assist you today?\n\n⚠️ **Important Disclaimer:** I provide general health information and am not a substitute for professional medical advice. Always consult with a healthcare provider for medical concerns.",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const { periods, cycleStats } = usePeriods();
  const { loggedSymptoms } = useSymptoms();
  
  const healthCoachService = HealthCoachService.getInstance();

  const getConversationContext = useCallback((): ConversationContext => {
    const sortedPeriods = [...periods].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const lastPeriod = sortedPeriods.length > 0 ? sortedPeriods[0] : null;
    
    // Calculate current cycle day
    let currentCycleDay: number | undefined;
    if (lastPeriod) {
      const today = new Date();
      const lastPeriodDate = new Date(lastPeriod.startDate);
      const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      currentCycleDay = daysSinceLastPeriod + 1;
    }
    
    // Get next period date from cycle stats
    const nextPeriodDate = cycleStats.nextPredictedPeriod ? new Date(cycleStats.nextPredictedPeriod) : undefined;
    
    // Get recent symptoms (last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentSymptoms = loggedSymptoms
      .filter((symptom) => new Date(symptom.date) >= recentDate)
      .map((symptom) => symptom.symptomName);

    return {
      currentCycleDay,
      nextPeriodDate,
      lastPeriodDate: lastPeriod ? new Date(lastPeriod.startDate) : undefined,
      recentSymptoms,
      cycleLength: cycleStats.averageCycleLength,
    };
  }, [periods, loggedSymptoms, cycleStats]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const context = getConversationContext();
      const response = await healthCoachService.generateResponse(content, context);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Add suggestions as separate messages if available
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: `**Suggestions:**\n${response.suggestions.map(s => `• ${s}`).join('\n')}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }
      
    } catch (error) {
      console.error('Error generating health coach response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [healthCoachService, getConversationContext]);

  const sendQuickQuestion = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your Virtual Health Coach. I'm here to help answer questions about your menstrual cycle, symptoms, and reproductive health. How can I assist you today?\n\n⚠️ **Important Disclaimer:** I provide general health information and am not a substitute for professional medical advice. Always consult with a healthcare provider for medical concerns.",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    sendQuickQuestion,
    clearConversation,
    quickQuestions: QUICK_QUESTIONS,
  };
});