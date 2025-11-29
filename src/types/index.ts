export interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master' | 'sage';
  profileImageUrl?: string;
  bio?: string;
  readingStreak: number;
  booksCompleted: number;
  chaptersRead: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'classic' | 'contemporary' | 'subscriber';
  contentType: 'novel' | 'play' | 'poem';
  coverImageUrl: string;
  description: string;
  wordCount: number;
  estimatedReadingTime: number;
  isFeatured: boolean;
  requiresPoints: boolean;
  pointsCost: number;
  earlyAccessUntil?: string;
}

export interface ReadingSession {
  bookId: string;
  currentChapter: number;
  totalChapters: number;
  progress: number;
  readingTimeSeconds: number;
  isCompleted: boolean;
}

export interface Discussion {
  id: string;
  bookId: string;
  title: string;
  content: string;
  authorUsername: string;
  discussionType: 'solo' | 'group' | 'communal';
  upvotes: number;
  messageCount: number;
  hasAudio: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  pointsAwarded: number;
  unlockedAt: string;
  icon: string;
}

export interface PointsTransaction {
  id: string;
  points: number;
  type: 'earned' | 'spent' | 'purchased' | 'bonus';
  source: string;
  description: string;
  createdAt: string;
}
