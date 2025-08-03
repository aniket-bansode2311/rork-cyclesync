export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  lastActivity?: Date;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  lastReply?: {
    author: string;
    createdAt: Date;
  };
}

export interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isLiked: boolean;
}

export interface CreateThreadData {
  categoryId: string;
  title: string;
  content: string;
}

export interface CreateReplyData {
  threadId: string;
  content: string;
}

export interface ForumSearchResult {
  type: 'thread' | 'reply';
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  categoryName: string;
}