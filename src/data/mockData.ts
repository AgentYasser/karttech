import { User, Book, ReadingSession, Discussion, Achievement } from "@/types";

export const mockUser: User = {
  id: "1",
  username: "BookLover",
  email: "reader@example.com",
  points: 2450,
  level: "intermediate",
  profileImageUrl: "",
  bio: "Passionate reader exploring classic and contemporary literature.",
  readingStreak: 12,
  booksCompleted: 8,
  chaptersRead: 156,
};

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "classic",
    contentType: "novel",
    coverImageUrl: "",
    description: "A romantic novel of manners set in early 19th-century England.",
    wordCount: 122000,
    estimatedReadingTime: 480,
    isFeatured: true,
    requiresPoints: false,
    pointsCost: 0,
  },
  {
    id: "2",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "classic",
    contentType: "novel",
    coverImageUrl: "",
    description: "A story of decadence and excess in the Jazz Age.",
    wordCount: 47000,
    estimatedReadingTime: 180,
    isFeatured: true,
    requiresPoints: false,
    pointsCost: 0,
  },
  {
    id: "3",
    title: "A Midsummer Night's Dream",
    author: "William Shakespeare",
    category: "classic",
    contentType: "play",
    coverImageUrl: "",
    description: "A comedic play about love, magic, and mischief.",
    wordCount: 16000,
    estimatedReadingTime: 90,
    isFeatured: false,
    requiresPoints: false,
    pointsCost: 0,
  },
  {
    id: "4",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    category: "contemporary",
    contentType: "novel",
    coverImageUrl: "",
    description: "A coming-of-age story set in the marshes of North Carolina.",
    wordCount: 96000,
    estimatedReadingTime: 360,
    isFeatured: true,
    requiresPoints: true,
    pointsCost: 500,
    earlyAccessUntil: "2024-02-01",
  },
  {
    id: "5",
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "contemporary",
    contentType: "novel",
    coverImageUrl: "",
    description: "A novel about infinite possibilities and second chances.",
    wordCount: 68000,
    estimatedReadingTime: 240,
    isFeatured: false,
    requiresPoints: true,
    pointsCost: 300,
  },
  {
    id: "6",
    title: "Whispers of the Soul",
    author: "Community Author",
    category: "subscriber",
    contentType: "poem",
    coverImageUrl: "",
    description: "A collection of poems exploring human emotions.",
    wordCount: 5000,
    estimatedReadingTime: 30,
    isFeatured: false,
    requiresPoints: false,
    pointsCost: 0,
  },
];

export const mockCurrentReading: ReadingSession = {
  bookId: "1",
  currentChapter: 12,
  totalChapters: 61,
  progress: 19,
  readingTimeSeconds: 14400,
  isCompleted: false,
};

export const mockDiscussions: Discussion[] = [
  {
    id: "1",
    bookId: "1",
    title: "Elizabeth's Growth Throughout the Novel",
    content: "Let's discuss how Elizabeth Bennet evolves as a character...",
    authorUsername: "LiteraryExplorer",
    discussionType: "communal",
    upvotes: 45,
    messageCount: 23,
    hasAudio: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    bookId: "2",
    title: "The Symbolism of the Green Light",
    content: "What does the green light represent in Gatsby's story?",
    authorUsername: "ClassicReader",
    discussionType: "group",
    upvotes: 32,
    messageCount: 18,
    hasAudio: false,
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    bookId: "4",
    title: "Nature as Character",
    content: "How does the marsh setting influence the story?",
    authorUsername: "NatureReader",
    discussionType: "solo",
    upvotes: 28,
    messageCount: 12,
    hasAudio: true,
    createdAt: "2024-01-13",
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "1",
    type: "reading_streak",
    name: "Week Warrior",
    description: "Maintained a 7-day reading streak",
    pointsAwarded: 100,
    unlockedAt: "2024-01-10",
    icon: "🔥",
  },
  {
    id: "2",
    type: "book_completion",
    name: "First Finish",
    description: "Completed your first book",
    pointsAwarded: 200,
    unlockedAt: "2024-01-05",
    icon: "📚",
  },
  {
    id: "3",
    type: "discussion",
    name: "Conversation Starter",
    description: "Created your first discussion",
    pointsAwarded: 50,
    unlockedAt: "2024-01-08",
    icon: "💬",
  },
  {
    id: "4",
    type: "community",
    name: "Helpful Reader",
    description: "Received 10 upvotes on discussions",
    pointsAwarded: 75,
    unlockedAt: "2024-01-12",
    icon: "⭐",
  },
];

export const sampleChapterContent = `
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."
`;
