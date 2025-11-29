import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBook, useBookChapters } from "@/hooks/useBooks";
import { useReadingSession, useUpsertReadingSession } from "@/hooks/useReadingSession";

const ReadingPage = () => {
  const { bookId } = useParams();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const { data: book, isLoading: bookLoading } = useBook(bookId);
  const { data: chapters, isLoading: chaptersLoading } = useBookChapters(bookId);
  const { data: session } = useReadingSession(bookId);
  const upsertSession = useUpsertReadingSession();

  // Set initial chapter from session
  useEffect(() => {
    if (session && chapters && chapters.length > 0) {
      const index = chapters.findIndex(c => c.chapter_number === session.current_chapter);
      if (index >= 0) setCurrentChapterIndex(index);
    }
  }, [session, chapters]);

  // Save reading progress
  useEffect(() => {
    if (bookId && chapters && chapters.length > 0) {
      const currentChapter = chapters[currentChapterIndex];
      if (currentChapter) {
        upsertSession.mutate({
          bookId,
          currentChapter: currentChapter.chapter_number,
        });
      }
    }
  }, [currentChapterIndex, bookId]);

  const handleWordClick = useCallback((word: string) => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (cleanWord.length > 2) {
      setSelectedWord(cleanWord);
      setShowDefinition(true);
    }
  }, []);

  const goToNextChapter = () => {
    if (chapters && currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  if (bookLoading || chaptersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Book not found</p>
        <Link to="/library">
          <Button>Go to Library</Button>
        </Link>
      </div>
    );
  }

  const currentChapter = chapters?.[currentChapterIndex];
  const totalChapters = chapters?.length || 1;
  const progress = Math.round(((currentChapterIndex + 1) / totalChapters) * 100);

  return (
    <div className="min-h-screen gradient-reading">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/library">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-center text-muted-foreground mt-1">
              {currentChapter?.title || `Chapter ${currentChapterIndex + 1}`} • {progress}%
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
        <p className="text-muted-foreground mb-8">
          {currentChapter?.title || `Chapter ${currentChapterIndex + 1}`}
        </p>

        {currentChapter ? (
          <div className="reading-content space-y-6">
            {currentChapter.content.split("\n\n").map((paragraph, pIndex) => (
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No content available for this chapter yet.</p>
            <p className="text-sm mt-2">
              Content from Project Gutenberg will be loaded here.
            </p>
          </div>
        )}
      </main>

      {/* Chapter Navigation */}
      <footer className="sticky bottom-0 bg-card border-t border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button
            variant="soft"
            className="gap-2"
            onClick={goToPrevChapter}
            disabled={currentChapterIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentChapterIndex + 1} / {totalChapters}
          </span>

          <Button
            variant="default"
            className="gap-2"
            onClick={goToNextChapter}
            disabled={!chapters || currentChapterIndex >= chapters.length - 1}
          >
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
              <p className="text-xs text-muted-foreground">Tap to look up definition</p>
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
            Dictionary integration coming soon. Words can be looked up using the Free Dictionary API.
          </p>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" className="flex-1">
              Add to Vocabulary
            </Button>
            <Button variant="soft" size="sm" className="flex-1">
              Search Online
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPage;
