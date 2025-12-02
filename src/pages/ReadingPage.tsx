import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBook, useBookChapters } from "@/hooks/useBooks";
import { useReadingSession, useUpsertReadingSession } from "@/hooks/useReadingSession";
import { useFetchBookContent } from "@/hooks/useImportBooks";
import { WordLookupDialog } from "@/components/reading/WordLookupDialog";
import { BookPaywall } from "@/components/reading/BookPaywall";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { useAwardPoints } from "@/hooks/usePoints";
import { useHasBookAccess } from "@/hooks/useBookPurchase";
import { useAuth } from "@/contexts/AuthContext";

const ReadingPage = () => {
  const { bookId } = useParams();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [lastAwardedChapter, setLastAwardedChapter] = useState<number>(-1);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { profile } = useAuth();

  const { data: book, isLoading: bookLoading } = useBook(bookId);
  const { data: chapters, isLoading: chaptersLoading, refetch: refetchChapters } = useBookChapters(bookId);
  const { data: session } = useReadingSession(bookId);
  const { data: accessInfo, isLoading: accessLoading } = useHasBookAccess(bookId);
  const upsertSession = useUpsertReadingSession();
  const fetchContent = useFetchBookContent();
  const awardPoints = useAwardPoints();
  
  // Free preview: first chapter is always available
  const FREE_PREVIEW_CHAPTERS = 1;
  const isPreviewChapter = currentChapterIndex < FREE_PREVIEW_CHAPTERS;
  const hasFullAccess = accessInfo?.hasAccess || false;
  const isSubscribed = profile?.is_subscribed || false;
  const canReadCurrentChapter = isPreviewChapter || hasFullAccess;
  
  // Show subscription prompt after reading first chapter if not subscribed
  const shouldShowSubscriptionPrompt = 
    !isSubscribed && 
    currentChapterIndex >= FREE_PREVIEW_CHAPTERS && 
    currentChapterIndex < FREE_PREVIEW_CHAPTERS + 1;

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

  const handleWordDoubleClick = useCallback((word: string) => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
    if (cleanWord.length > 2) {
      setSelectedWord(cleanWord);
      setShowDefinition(true);
    }
  }, []);

  const goToNextChapter = () => {
    if (chapters && currentChapterIndex < chapters.length - 1) {
      const nextChapterIndex = currentChapterIndex + 1;
      const nextChapterRequiresAccess = nextChapterIndex >= FREE_PREVIEW_CHAPTERS;
      
      // Check if user can access next chapter
      if (nextChapterRequiresAccess && !hasFullAccess && accessInfo?.requiresPoints) {
        // Can't navigate - show is handled by paywall in content
        return;
      }
      
      // Show subscription prompt if user is not subscribed and trying to continue reading
      if (nextChapterRequiresAccess && !isSubscribed && !hasFullAccess) {
        setShowSubscriptionModal(true);
        return;
      }
      
      // Award points for completing a chapter (only once per chapter)
      if (currentChapterIndex > lastAwardedChapter) {
        awardPoints.mutate({ source: "reading_chapter" });
        setLastAwardedChapter(currentChapterIndex);
      }
      setCurrentChapterIndex(nextChapterIndex);
    }
  };
  
  const handleSubscribe = (plan: "monthly" | "annual") => {
    // In production, integrate with payment gateway
    console.log("Subscribing to plan:", plan);
    setShowSubscriptionModal(false);
    // After successful subscription, refresh user profile
    // This would typically be handled by your payment integration
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleImportContent = async () => {
    if (!book || !book.gutenberg_id || !bookId) return;
    
    try {
      await fetchContent.mutateAsync({
        gutenberg_id: book.gutenberg_id,
        book_id: bookId,
      });
      refetchChapters();
    } catch (error) {
      console.error("Failed to import book:", error);
    }
  };

  // Auto-import book content if it doesn't exist
  useEffect(() => {
    if (book && book.gutenberg_id && bookId && (!chapters || chapters.length === 0) && !fetchContent.isPending) {
      handleImportContent();
    }
  }, [book, bookId, chapters]);

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
          <>
            {canReadCurrentChapter ? (
              <div className="reading-content space-y-6">
                {currentChapter.content.split("\n\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="leading-relaxed">
                    {paragraph.split(/(\s+)/).map((word, wIndex) => {
                      const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
                      const isClickable = cleanWord.length > 2 && !word.match(/^\s+$/);

                      return (
                        <span
                          key={`${pIndex}-${wIndex}`}
                          onDoubleClick={() => isClickable && handleWordDoubleClick(word)}
                          className={
                            isClickable
                              ? "cursor-pointer hover:bg-primary/50 rounded px-0.5 transition-colors"
                              : ""
                          }
                          title={isClickable ? "Double-click to look up word" : ""}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                ))}
                
                {/* Show paywall after first chapter if book requires points */}
                {isPreviewChapter && accessInfo?.requiresPoints && !hasFullAccess && chapters && currentChapterIndex === chapters.length - 1 && (
                  <BookPaywall
                    bookId={bookId!}
                    bookTitle={book.title}
                    pointsCost={accessInfo.pointsCost}
                    earlyAccessUntil={accessInfo.earlyAccessUntil}
                  />
                )}
              </div>
            ) : (
              /* Locked chapter - show preview snippet + paywall */
              <div className="reading-content space-y-6">
                {currentChapter.content.split("\n\n").slice(0, 2).map((paragraph, pIndex) => (
                  <p key={pIndex} className="leading-relaxed">
                    {paragraph.split(/(\s+)/).map((word, wIndex) => (
                      <span key={`${pIndex}-${wIndex}`}>{word}</span>
                    ))}
                  </p>
                ))}
                
                <BookPaywall
                  bookId={bookId!}
                  bookTitle={book.title}
                  pointsCost={accessInfo?.pointsCost || 0}
                  earlyAccessUntil={accessInfo?.earlyAccessUntil}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            {fetchContent.isPending ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Importing book content from Project Gutenberg...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a moment.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No content available for this book yet.</p>
                {book.gutenberg_id ? (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      This book is available on Project Gutenberg. Import will start automatically.
                    </p>
                    <Button 
                      onClick={handleImportContent}
                      disabled={fetchContent.isPending}
                      className="gap-2"
                    >
                      {fetchContent.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Import Now
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    This book doesn't have content available yet.
                  </p>
                )}
              </>
            )}
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

          {(() => {
            const nextChapterIndex = currentChapterIndex + 1;
            const nextChapterLocked = nextChapterIndex >= FREE_PREVIEW_CHAPTERS && !hasFullAccess && accessInfo?.requiresPoints;
            const isLastChapter = !chapters || currentChapterIndex >= chapters.length - 1;
            
            return (
              <Button
                variant="default"
                className="gap-2"
                onClick={goToNextChapter}
                disabled={isLastChapter || nextChapterLocked}
              >
                {nextChapterLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Locked
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            );
          })()}
        </div>
      </footer>

      {/* Word Lookup Dialog */}
      <WordLookupDialog
        word={selectedWord || ""}
        bookId={bookId}
        open={showDefinition}
        onOpenChange={setShowDefinition}
      />
      
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        feature="reading this book"
      />
    </div>
  );
};

export default ReadingPage;
