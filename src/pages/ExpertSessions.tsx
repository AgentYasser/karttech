import { useState } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExpertCard, type Expert } from "@/components/experts/ExpertCard";
import { BookingModal } from "@/components/experts/BookingModal";
import { ExpertContentFeed } from "@/components/experts/ExpertContentFeed";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for experts
const MOCK_EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Dr. Eleanor Vance',
    title: 'Professor of Victorian Literature',
    bio: 'Specializing in the Gothic novel and 19th-century women writers. I help readers uncover the subtle social commentary in Austen and Brontë.',
    expertiseAreas: ['Victorian Era', 'Gothic Fiction', 'Jane Austen', 'Feminist Theory'],
    rating: 4.9,
    reviewCount: 124,
    hourlyRate: 6000,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'James Baldwin II',
    title: 'Award-Winning Essayist',
    bio: 'Exploring the intersection of race, identity, and modern literature. Let\'s discuss the power of narrative in shaping social change.',
    expertiseAreas: ['Modernism', 'African American Lit', 'Creative Non-fiction'],
    rating: 5.0,
    reviewCount: 89,
    hourlyRate: 8500,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    title: 'Sci-Fi & Fantasy Critic',
    bio: 'Hugo Award nominee. I break down complex world-building and magic systems. Perfect for deep dives into Sanderson, Jemisin, or Le Guin.',
    expertiseAreas: ['Science Fiction', 'Fantasy', 'World Building', 'Speculative Fiction'],
    rating: 4.8,
    reviewCount: 215,
    hourlyRate: 4500,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Marcus Thorne',
    title: 'Shakespearean Scholar',
    bio: 'Former Royal Shakespeare Company dramaturg. I make the Bard accessible and exciting. "The play\'s the thing!"',
    expertiseAreas: ['Shakespeare', 'Elizabethan Drama', 'Performance Studies'],
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 7000,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
];

const ExpertSessions = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const filteredExperts = MOCK_EXPERTS.filter(expert => {
    const matchesSearch =
      expert.name.toLowerCase().includes(search.toLowerCase()) ||
      expert.title.toLowerCase().includes(search.toLowerCase()) ||
      expert.expertiseAreas.some(area => area.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      expert.expertiseAreas.some(area => area.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const handleBookSession = (expertId: string) => {
    const expert = MOCK_EXPERTS.find(e => e.id === expertId);
    if (expert) {
      setSelectedExpert(expert);
      setIsBookingOpen(true);
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-reading font-bold text-card-foreground mb-4">
            Connect with Literary Experts
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deepen your understanding through 1-on-1 sessions with professors, authors, and critics.
            From quick 7-minute chats to extended deep-dives.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, topic, or expertise..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All Experts</TabsTrigger>
              <TabsTrigger value="classic">Classics</TabsTrigger>
              <TabsTrigger value="sci-fi">Sci-Fi/Fantasy</TabsTrigger>
              <TabsTrigger value="modern">Modern</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onBook={handleBookSession}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredExperts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No experts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}

        {/* Expert Content Feed */}
        <div className="mt-20 mb-12">
          <ExpertContentFeed />
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Are you a literary expert?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our community of verified experts. Share your knowledge, host sessions, and earn income while connecting with passionate readers.
          </p>
          <Button size="lg" className="font-semibold">
            Apply to Become an Expert
          </Button>
        </div>

        <BookingModal
          expert={selectedExpert}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          userPoints={750} // Mock points
        />
      </div>
    </MainLayout>
  );
};

export default ExpertSessions;

