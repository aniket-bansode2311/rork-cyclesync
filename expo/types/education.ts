export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  type: 'article' | 'video';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number; // in minutes for videos, reading time for articles
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ContentCategory = 
  | 'periods'
  | 'fertility'
  | 'pregnancy'
  | 'wellness'
  | 'conditions'
  | 'menopause'
  | 'birth-control';

export interface SearchFilters {
  category?: ContentCategory;
  type?: 'article' | 'video';
  tags?: string[];
}