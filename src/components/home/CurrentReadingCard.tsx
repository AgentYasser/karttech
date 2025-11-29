import { Link } from "react-router-dom";
import { BookOpen, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrentReading } from "@/hooks/useReadingSession";
import { useBookChapters } from "@/hooks/useBooks";

export function CurrentReadingCard() {
  const { data: currentReading, isLoading } = useCurrentReading();
  
  const bookId = currentReading?.book_id;
  const { data: chapters } = useBookChapters(bookId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border animate-fade-up animation-delay-100">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentReading || !currentReading.books) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border animate-fade-up animation-delay-100">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-foreground" />
          <h2 className="font-medium text-card-foreground">Start Reading</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You haven't started reading any books yet. Explore our library to find your next great read!
        </p>
        <Link to="/library">
          <Button className="w-full">
            Browse Library
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  const book = currentReading.books as any;
  const totalChapters = chapters?.length || 1;
  const progress = Math.round((currentReading.current_chapter / totalChapters) * 100);
  const readingTimeMinutes = Math.floor(currentReading.reading_time_seconds / 60);
  const hours = Math.floor(readingTimeMinutes / 60);
  const minutes = readingTimeMinutes % 60;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border animate-fade-up animation-delay-100">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-foreground" />
        <h2 className="font-medium text-card-foreground">Continue Reading</h2>
      </div>

      <div className="flex gap-4">
        <div className="w-20 h-28 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center text-3xl shadow-soft shrink-0">
          {book.content_type === "novel" && "📚"}
          {book.content_type === "play" && "🎭"}
          {book.content_type === "poem" && "📜"}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-reading font-semibold text-card-foreground truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Chapter {currentReading.current_chapter} of {totalChapters}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} read</span>
          </div>
        </div>
      </div>

      <Link to={`/read/${book.id}`}>
        <Button className="w-full mt-4 group" size="lg">
          Continue Reading
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}
