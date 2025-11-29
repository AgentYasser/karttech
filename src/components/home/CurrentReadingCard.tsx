import { Link } from "react-router-dom";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockBooks, mockCurrentReading } from "@/data/mockData";

export function CurrentReadingCard() {
  const book = mockBooks.find((b) => b.id === mockCurrentReading.bookId);
  if (!book) return null;

  const readingTimeMinutes = Math.floor(mockCurrentReading.readingTimeSeconds / 60);
  const hours = Math.floor(readingTimeMinutes / 60);
  const minutes = readingTimeMinutes % 60;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border animate-fade-up animation-delay-100">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-foreground" />
        <h2 className="font-medium text-card-foreground">Continue Reading</h2>
      </div>

      <div className="flex gap-4">
        <div className="w-20 h-28 bg-muted rounded-lg flex items-center justify-center text-3xl shadow-soft shrink-0">
          📖
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-reading font-semibold text-card-foreground truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Chapter {mockCurrentReading.currentChapter} of {mockCurrentReading.totalChapters}</span>
              <span>{mockCurrentReading.progress}%</span>
            </div>
            <Progress value={mockCurrentReading.progress} className="h-2" />
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
