import { useState, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { EducationalContent, ContentCategory, SearchFilters } from '@/types/education';

// Mock educational content data
const mockEducationalContent: EducationalContent[] = [
  // Periods Category
  {
    id: '1',
    title: 'Understanding Your Menstrual Cycle',
    description: 'Learn about the phases of your menstrual cycle and what to expect.',
    category: 'periods',
    type: 'article',
    content: 'The menstrual cycle is a monthly process your body goes through to prepare for pregnancy. It typically lasts 28 days but can range from 21 to 35 days. The cycle has four main phases: menstrual phase, follicular phase, ovulation, and luteal phase. Understanding these phases can help you track your fertility and overall reproductive health.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    duration: 5,
    tags: ['cycle', 'phases', 'menstruation'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Managing Period Pain',
    description: 'Natural and medical approaches to reduce menstrual cramps.',
    category: 'periods',
    type: 'video',
    content: 'Period pain, also known as dysmenorrhea, affects many women. This video covers various strategies including heat therapy, gentle exercise, dietary changes, and when to seek medical help.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    videoUrl: 'https://example.com/period-pain-video',
    duration: 8,
    tags: ['pain', 'cramps', 'relief'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  // Fertility Category
  {
    id: '3',
    title: 'Tracking Ovulation Signs',
    description: 'Learn to identify the signs of ovulation for better fertility awareness.',
    category: 'fertility',
    type: 'article',
    content: 'Ovulation typically occurs around day 14 of a 28-day cycle. Key signs include changes in cervical mucus, basal body temperature rise, and ovulation pain. Tracking these signs can help you understand your fertile window.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
    duration: 6,
    tags: ['ovulation', 'fertility', 'tracking'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    title: 'Basal Body Temperature Charting',
    description: 'A comprehensive guide to BBT tracking for fertility awareness.',
    category: 'fertility',
    type: 'video',
    content: 'Learn how to properly measure and chart your basal body temperature to identify ovulation patterns and improve your understanding of your menstrual cycle.',
    imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop',
    videoUrl: 'https://example.com/bbt-video',
    duration: 12,
    tags: ['BBT', 'temperature', 'charting'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  // Pregnancy Category
  {
    id: '5',
    title: 'First Trimester: What to Expect',
    description: 'A guide to the changes and milestones in your first trimester.',
    category: 'pregnancy',
    type: 'article',
    content: 'The first trimester spans weeks 1-12 of pregnancy. Common experiences include morning sickness, fatigue, breast tenderness, and frequent urination. This is also when major organ development occurs.',
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop',
    duration: 7,
    tags: ['pregnancy', 'first trimester', 'symptoms'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  // Wellness Category
  {
    id: '6',
    title: 'Nutrition for Hormonal Balance',
    description: 'Foods and nutrients that support healthy hormone levels.',
    category: 'wellness',
    type: 'article',
    content: 'Proper nutrition plays a crucial role in maintaining hormonal balance. Key nutrients include omega-3 fatty acids, magnesium, vitamin D, and B vitamins. Learn which foods to include in your diet.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    duration: 8,
    tags: ['nutrition', 'hormones', 'diet'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  // Conditions Category
  {
    id: '7',
    title: 'Understanding PCOS',
    description: 'Polycystic Ovary Syndrome: symptoms, diagnosis, and management.',
    category: 'conditions',
    type: 'video',
    content: 'PCOS is a common hormonal disorder affecting women of reproductive age. Learn about the symptoms, diagnostic criteria, and management strategies including lifestyle changes and medical treatments.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
    videoUrl: 'https://example.com/pcos-video',
    duration: 15,
    tags: ['PCOS', 'hormones', 'condition'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Menopause Category
  {
    id: '8',
    title: 'Perimenopause: The Transition Years',
    description: 'Understanding the changes that occur before menopause.',
    category: 'menopause',
    type: 'article',
    content: 'Perimenopause is the transitional period before menopause when hormone levels begin to fluctuate. Symptoms may include irregular periods, hot flashes, mood changes, and sleep disturbances.',
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop',
    duration: 9,
    tags: ['perimenopause', 'transition', 'hormones'],
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2023-12-28'),
  },
  // Birth Control Category
  {
    id: '9',
    title: 'Birth Control Options: A Complete Guide',
    description: 'Compare different contraceptive methods to find what works for you.',
    category: 'birth-control',
    type: 'article',
    content: 'There are many birth control options available, from hormonal methods like the pill and IUDs to barrier methods like condoms. Each has different effectiveness rates, benefits, and considerations.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    duration: 10,
    tags: ['contraception', 'birth control', 'options'],
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2023-12-25'),
  },
];

export const [EducationProvider, useEducation] = createContextHook(() => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});
  const [bookmarkedContent, setBookmarkedContent] = useState<string[]>([]);

  // Filter content based on search query and filters
  const filteredContent = useMemo(() => {
    let filtered = mockEducationalContent;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedFilters.category) {
      filtered = filtered.filter(content => content.category === selectedFilters.category);
    }

    // Apply type filter
    if (selectedFilters.type) {
      filtered = filtered.filter(content => content.type === selectedFilters.type);
    }

    // Apply tag filters
    if (selectedFilters.tags && selectedFilters.tags.length > 0) {
      filtered = filtered.filter(content => 
        selectedFilters.tags!.some(tag => content.tags.includes(tag))
      );
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [searchQuery, selectedFilters]);

  // Get content by category
  const getContentByCategory = (category: ContentCategory) => {
    return mockEducationalContent.filter(content => content.category === category);
  };

  // Get content by ID
  const getContentById = (id: string) => {
    return mockEducationalContent.find(content => content.id === id);
  };

  // Get all unique tags
  const getAllTags = () => {
    const tags = new Set<string>();
    mockEducationalContent.forEach(content => {
      content.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  // Bookmark functions
  const toggleBookmark = (contentId: string) => {
    setBookmarkedContent(prev => 
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const isBookmarked = (contentId: string) => {
    return bookmarkedContent.includes(contentId);
  };

  const getBookmarkedContent = () => {
    return mockEducationalContent.filter(content => bookmarkedContent.includes(content.id));
  };

  return {
    // Content data
    allContent: mockEducationalContent,
    filteredContent,
    
    // Search and filters
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    
    // Helper functions
    getContentByCategory,
    getContentById,
    getAllTags,
    
    // Bookmarks
    bookmarkedContent,
    toggleBookmark,
    isBookmarked,
    getBookmarkedContent,
  };
});