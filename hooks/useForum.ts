import { useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { 
  ForumCategory, 
  ForumThread, 
  ForumReply, 
  CreateThreadData, 
  CreateReplyData,
  ForumSearchResult 
} from '@/types/forum';

// Mock data for placeholder functionality
const mockCategories: ForumCategory[] = [
  {
    id: '1',
    name: 'General Chat',
    description: 'General discussions about periods and women\'s health',
    icon: 'MessageCircle',
    threadCount: 45,
    lastActivity: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    name: 'TTC (Trying to Conceive)',
    description: 'Support and discussions for those trying to conceive',
    icon: 'Heart',
    threadCount: 32,
    lastActivity: new Date('2024-01-14T15:45:00Z')
  },
  {
    id: '3',
    name: 'PCOS Support',
    description: 'Support group for those with PCOS',
    icon: 'Users',
    threadCount: 28,
    lastActivity: new Date('2024-01-13T09:20:00Z')
  },
  {
    id: '4',
    name: 'Endometriosis',
    description: 'Support and information about endometriosis',
    icon: 'Shield',
    threadCount: 19,
    lastActivity: new Date('2024-01-12T14:10:00Z')
  },
  {
    id: '5',
    name: 'Pregnancy & Birth',
    description: 'Discussions about pregnancy and childbirth',
    icon: 'Baby',
    threadCount: 41,
    lastActivity: new Date('2024-01-15T08:15:00Z')
  },
  {
    id: '6',
    name: 'Menopause',
    description: 'Support for those going through menopause',
    icon: 'Flower',
    threadCount: 15,
    lastActivity: new Date('2024-01-11T16:30:00Z')
  }
];

const mockThreads: ForumThread[] = [
  {
    id: '1',
    categoryId: '1',
    title: 'New to tracking - any tips?',
    content: 'Hi everyone! I just started tracking my cycle and would love some advice on what to look out for.',
    author: {
      id: 'user1',
      username: 'CycleNewbie',
      avatar: undefined
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    replyCount: 8,
    viewCount: 45,
    isPinned: false,
    isLocked: false,
    lastReply: {
      author: 'HealthyLiving',
      createdAt: new Date('2024-01-15T14:20:00Z')
    }
  },
  {
    id: '2',
    categoryId: '2',
    title: 'Ovulation tracking methods',
    content: 'What are the most reliable methods for tracking ovulation? I\'ve been using OPKs but wondering about other options.',
    author: {
      id: 'user2',
      username: 'TTCJourney',
      avatar: undefined
    },
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-14T15:45:00Z'),
    replyCount: 12,
    viewCount: 67,
    isPinned: true,
    isLocked: false,
    lastReply: {
      author: 'FertilityExpert',
      createdAt: new Date('2024-01-15T09:10:00Z')
    }
  }
];

const mockReplies: ForumReply[] = [
  {
    id: '1',
    threadId: '1',
    content: 'Welcome! I\'d recommend starting with tracking your period dates and any symptoms you notice.',
    author: {
      id: 'user3',
      username: 'HealthyLiving',
      avatar: undefined
    },
    createdAt: new Date('2024-01-15T11:15:00Z'),
    updatedAt: new Date('2024-01-15T11:15:00Z'),
    likes: 5,
    isLiked: false
  },
  {
    id: '2',
    threadId: '1',
    content: 'Also consider tracking your mood and energy levels - it can be really insightful!',
    author: {
      id: 'user4',
      username: 'WellnessWarrior',
      avatar: undefined
    },
    createdAt: new Date('2024-01-15T14:20:00Z'),
    updatedAt: new Date('2024-01-15T14:20:00Z'),
    likes: 3,
    isLiked: true
  }
];

export const [ForumProvider, useForum] = createContextHook(() => {
  const [categories, setCategories] = useState<ForumCategory[]>(mockCategories);
  const [threads, setThreads] = useState<ForumThread[]>(mockThreads);
  const [replies, setReplies] = useState<ForumReply[]>(mockReplies);
  const [searchResults, setSearchResults] = useState<ForumSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getThreadsByCategory = (categoryId: string): ForumThread[] => {
    return threads.filter(thread => thread.categoryId === categoryId);
  };

  const getRepliesByThread = (threadId: string): ForumReply[] => {
    return replies.filter(reply => reply.threadId === threadId);
  };

  const getThreadById = (threadId: string): ForumThread | undefined => {
    return threads.find(thread => thread.id === threadId);
  };

  const getCategoryById = (categoryId: string): ForumCategory | undefined => {
    return categories.find(category => category.id === categoryId);
  };

  const createThread = async (data: CreateThreadData): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newThread: ForumThread = {
      id: Date.now().toString(),
      categoryId: data.categoryId,
      title: data.title,
      content: data.content,
      author: {
        id: 'current-user',
        username: 'You',
        avatar: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      replyCount: 0,
      viewCount: 1,
      isPinned: false,
      isLocked: false
    };
    
    setThreads(prev => [newThread, ...prev]);
    
    // Update category thread count
    setCategories(prev => prev.map(cat => 
      cat.id === data.categoryId 
        ? { ...cat, threadCount: cat.threadCount + 1, lastActivity: new Date() }
        : cat
    ));
    
    setIsLoading(false);
  };

  const createReply = async (data: CreateReplyData): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReply: ForumReply = {
      id: Date.now().toString(),
      threadId: data.threadId,
      content: data.content,
      author: {
        id: 'current-user',
        username: 'You',
        avatar: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      isLiked: false
    };
    
    setReplies(prev => [...prev, newReply]);
    
    // Update thread reply count and last reply
    setThreads(prev => prev.map(thread => 
      thread.id === data.threadId 
        ? { 
            ...thread, 
            replyCount: thread.replyCount + 1,
            updatedAt: new Date(),
            lastReply: {
              author: 'You',
              createdAt: new Date()
            }
          }
        : thread
    ));
    
    setIsLoading(false);
  };

  const searchForum = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const threadResults: ForumSearchResult[] = threads
      .filter(thread => 
        thread.title.toLowerCase().includes(query.toLowerCase()) ||
        thread.content.toLowerCase().includes(query.toLowerCase())
      )
      .map(thread => ({
        type: 'thread' as const,
        id: thread.id,
        title: thread.title,
        content: thread.content,
        author: thread.author.username,
        createdAt: thread.createdAt,
        categoryName: getCategoryById(thread.categoryId)?.name || 'Unknown'
      }));
    
    const replyResults: ForumSearchResult[] = replies
      .filter(reply => 
        reply.content.toLowerCase().includes(query.toLowerCase())
      )
      .map(reply => {
        const thread = getThreadById(reply.threadId);
        return {
          type: 'reply' as const,
          id: reply.id,
          title: thread?.title || 'Unknown Thread',
          content: reply.content,
          author: reply.author.username,
          createdAt: reply.createdAt,
          categoryName: thread ? getCategoryById(thread.categoryId)?.name || 'Unknown' : 'Unknown'
        };
      });
    
    setSearchResults([...threadResults, ...replyResults]);
    setIsLoading(false);
  };

  const toggleLike = async (replyId: string): Promise<void> => {
    setReplies(prev => prev.map(reply => 
      reply.id === replyId 
        ? { 
            ...reply, 
            isLiked: !reply.isLiked,
            likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
          }
        : reply
    ));
  };

  const incrementViewCount = (threadId: string): void => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, viewCount: thread.viewCount + 1 }
        : thread
    ));
  };

  return {
    categories,
    threads,
    replies,
    searchResults,
    isLoading,
    getThreadsByCategory,
    getRepliesByThread,
    getThreadById,
    getCategoryById,
    createThread,
    createReply,
    searchForum,
    toggleLike,
    incrementViewCount
  };
});