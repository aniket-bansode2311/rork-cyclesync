import { db } from './config';
import { symptoms, achievements, forumCategories } from './schema';

// Predefined symptoms data
const predefinedSymptoms = [
  // Physical symptoms
  { name: 'Cramps', category: 'physical' as const, description: 'Menstrual cramps or abdominal pain' },
  { name: 'Headache', category: 'physical' as const, description: 'Head pain or tension' },
  { name: 'Bloating', category: 'physical' as const, description: 'Abdominal bloating or swelling' },
  { name: 'Breast Tenderness', category: 'physical' as const, description: 'Tender or sore breasts' },
  { name: 'Back Pain', category: 'physical' as const, description: 'Lower back pain' },
  { name: 'Fatigue', category: 'physical' as const, description: 'Feeling tired or exhausted' },
  { name: 'Nausea', category: 'physical' as const, description: 'Feeling sick to stomach' },
  { name: 'Acne', category: 'physical' as const, description: 'Skin breakouts' },
  { name: 'Hot Flashes', category: 'physical' as const, description: 'Sudden feeling of heat' },
  { name: 'Night Sweats', category: 'physical' as const, description: 'Excessive sweating at night' },
  
  // Emotional symptoms
  { name: 'Mood Swings', category: 'emotional' as const, description: 'Rapid changes in mood' },
  { name: 'Irritability', category: 'emotional' as const, description: 'Feeling easily annoyed or angry' },
  { name: 'Anxiety', category: 'emotional' as const, description: 'Feeling worried or nervous' },
  { name: 'Depression', category: 'emotional' as const, description: 'Feeling sad or down' },
  { name: 'Emotional Sensitivity', category: 'emotional' as const, description: 'Feeling more sensitive than usual' },
  { name: 'Crying Spells', category: 'emotional' as const, description: 'Sudden episodes of crying' },
  
  // Behavioral symptoms
  { name: 'Food Cravings', category: 'behavioral' as const, description: 'Strong desire for specific foods' },
  { name: 'Sleep Changes', category: 'behavioral' as const, description: 'Changes in sleep patterns' },
  { name: 'Concentration Issues', category: 'behavioral' as const, description: 'Difficulty focusing or concentrating' },
  { name: 'Social Withdrawal', category: 'behavioral' as const, description: 'Avoiding social interactions' },
  { name: 'Increased Appetite', category: 'behavioral' as const, description: 'Eating more than usual' },
  { name: 'Decreased Libido', category: 'behavioral' as const, description: 'Reduced interest in sex' },
];

// Initial achievements data
const initialAchievements = [
  {
    name: 'First Log',
    description: 'Log your first period',
    type: 'milestone' as const,
    criteria: { action: 'log_period', count: 1 },
    badgeIcon: 'calendar-check',
    points: 10,
  },
  {
    name: 'Consistent Logger',
    description: 'Log symptoms for 7 consecutive days',
    type: 'streak' as const,
    criteria: { action: 'log_symptoms', streak: 7 },
    badgeIcon: 'trending-up',
    points: 25,
  },
  {
    name: 'Explorer',
    description: 'Explore the educational content library',
    type: 'exploration' as const,
    criteria: { action: 'view_education', count: 5 },
    badgeIcon: 'book-open',
    points: 15,
  },
  {
    name: 'Hydration Hero',
    description: 'Log your daily water goal for 3 days in a row',
    type: 'streak' as const,
    criteria: { action: 'water_goal_met', streak: 3 },
    badgeIcon: 'droplets',
    points: 20,
  },
  {
    name: 'Wellness Warrior',
    description: 'Complete 30 days of health tracking',
    type: 'consistency' as const,
    criteria: { action: 'daily_tracking', count: 30 },
    badgeIcon: 'heart',
    points: 50,
  },
  {
    name: 'Community Helper',
    description: 'Help others by posting in the forum',
    type: 'milestone' as const,
    criteria: { action: 'forum_post', count: 5 },
    badgeIcon: 'users',
    points: 30,
  },
  {
    name: 'Cycle Expert',
    description: 'Track 3 complete cycles',
    type: 'milestone' as const,
    criteria: { action: 'complete_cycle', count: 3 },
    badgeIcon: 'calendar',
    points: 40,
  },
  {
    name: 'Mindful Tracker',
    description: 'Log mood for 14 consecutive days',
    type: 'streak' as const,
    criteria: { action: 'log_mood', streak: 14 },
    badgeIcon: 'smile',
    points: 35,
  },
];

// Forum categories data
const forumCategoriesData = [
  {
    name: 'General Discussion',
    description: 'General topics and introductions',
    category: 'general' as const,
    sortOrder: 1,
  },
  {
    name: 'Period Talk',
    description: 'Discussions about periods and menstrual health',
    category: 'periods' as const,
    sortOrder: 2,
  },
  {
    name: 'Fertility & TTC',
    description: 'Fertility tracking and trying to conceive',
    category: 'fertility' as const,
    sortOrder: 3,
  },
  {
    name: 'Pregnancy Journey',
    description: 'Pregnancy experiences and support',
    category: 'pregnancy' as const,
    sortOrder: 4,
  },
  {
    name: 'Menopause Support',
    description: 'Menopause experiences and advice',
    category: 'menopause' as const,
    sortOrder: 5,
  },
  {
    name: 'Birth Control',
    description: 'Birth control methods and experiences',
    category: 'birth_control' as const,
    sortOrder: 6,
  },
  {
    name: 'Wellness & Lifestyle',
    description: 'Health, fitness, and lifestyle discussions',
    category: 'wellness' as const,
    sortOrder: 7,
  },
  {
    name: 'Support & Encouragement',
    description: 'Emotional support and encouragement',
    category: 'support' as const,
    sortOrder: 8,
  },
];

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed symptoms
    console.log('Seeding symptoms...');
    await db.insert(symptoms).values(predefinedSymptoms).onConflictDoNothing();

    // Seed achievements
    console.log('Seeding achievements...');
    await db.insert(achievements).values(initialAchievements).onConflictDoNothing();

    // Seed forum categories
    console.log('Seeding forum categories...');
    await db.insert(forumCategories).values(forumCategoriesData).onConflictDoNothing();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}