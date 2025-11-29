import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockBooks, mockCurrentReading, sampleChapterContent } from "@/data/mockData";

const ReadingPage = () => {
  const { bookId } = useParams();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);

  const book = mockBooks.find((b) => b.id === bookId);

  const handleWordClick = useCallback((word: string) => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (cleanWord.length > 2) {
      setSelectedWord(cleanWord);
      setShowDefinition(true);
    }
  }, []);

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Book not found</p>
      </div>
    );
  }

  const words = sampleChapterContent.split(/(\s+)/);

  return (
    <div className="min-h-screen gradient-reading">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1 mx-4">
            <Progress value={mockCurrentReading.progress} className="h-1.5" />
            <p className="text-xs text-center text-muted-foreground mt-1">
              Chapter {mockCurrentReading.currentChapter} • {mockCurrentReading.progress}%
            </p>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Reading Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="font-reading text-2xl font-semibold text-card-foreground mb-2">
          {book.title}
        </h1>
        <p className="text-muted-foreground mb-8">Chapter {mockCurrentReading.currentChapter}</p>

        <div className="reading-content space-y-6">
          {sampleChapterContent.split("\n\n").map((paragraph, pIndex) => (
            <p key={pIndex} className="leading-relaxed">
              {paragraph.split(/(\s+)/).map((word, wIndex) => {
                const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
                const isClickable = cleanWord.length > 2 && !word.match(/^\s+$/);

                return (
                  <span
                    key={`${pIndex}-${wIndex}`}
                    onClick={() => isClickable && handleWordClick(word)}
                    className={
                      isClickable
                        ? "cursor-pointer hover:bg-primary/50 rounded px-0.5 transition-colors"
                        : ""
                    }
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </main>

      {/* Chapter Navigation */}
      <footer className="sticky bottom-0 bg-card border-t border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button variant="soft" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {mockCurrentReading.currentChapter} / {mockCurrentReading.totalChapters}
          </span>

          <Button variant="default" className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>

      {/* Dictionary Popup */}
      {showDefinition && selectedWord && (
        <div className="fixed inset-x-4 bottom-24 max-w-md mx-auto bg-card rounded-2xl shadow-hover border border-border p-5 z-50 animate-fade-up">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-reading text-lg font-semibold text-card-foreground capitalize">
                {selectedWord}
              </h3>
              <p className="text-xs text-muted-foreground">noun • /prɒpəti/</p>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowDefinition(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed">
            A thing or things belonging to someone; possessions collectively. Something
            regarded as being owned by, or belonging to, a person or group.
          </p>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" className="flex-1">
              Add to Vocabulary
            </Button>
            <Button variant="soft" size="sm" className="flex-1">
              More Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPage;
