/**
 * One-time setup page to seed books and import content
 * Visit this page once to populate the entire library
 */
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GUTENBERG_BOOKS } from "@/data/gutenbergCatalog";
import { importBookContent } from "@/utils/bookContentManager";

export default function SetupBooks() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentBook: "" });
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  });
  const [isComplete, setIsComplete] = useState(false);

  const setupAllBooks = async () => {
    setIsRunning(true);
    setProgress({ current: 0, total: GUTENBERG_BOOKS.length, currentBook: "" });
    
    let successCount = 0;
    let failedCount = 0;
    const errorList: string[] = [];

    for (let i = 0; i < GUTENBERG_BOOKS.length; i++) {
      const bookData = GUTENBERG_BOOKS[i];
      
      setProgress({
        current: i + 1,
        total: GUTENBERG_BOOKS.length,
        currentBook: bookData.title,
      });

      try {
        // Step 1: Create/verify book exists in database
        const { data: existingBook } = await supabase
          .from("books")
          .select("id, gutenberg_id")
          .eq("title", bookData.title)
          .eq("author", bookData.author)
          .maybeSingle();

        let bookId: string;

        if (existingBook) {
          bookId = existingBook.id;
          console.log(`✓ Book exists: ${bookData.title}`);
        } else {
          // Create book
          const { data: newBook, error: insertError } = await supabase
            .from("books")
            .insert({
              title: bookData.title,
              author: bookData.author,
              description: bookData.description,
              category: bookData.category,
              content_type: bookData.contentType,
              gutenberg_id: bookData.gutenberg_id,
              word_count: bookData.estimatedWordCount,
              estimated_reading_time: Math.ceil(bookData.estimatedWordCount / 250),
              is_featured: i < 5, // First 5 books are featured
              requires_points: false,
              points_cost: 0,
            })
            .select("id")
            .single();

          if (insertError || !newBook) {
            throw new Error(`Failed to create book: ${insertError?.message}`);
          }

          bookId = newBook.id;
          console.log(`✓ Created book: ${bookData.title}`);
        }

        // Step 2: Import content from Gutenberg
        const result = await importBookContent(bookId, bookData.gutenberg_id);

        if (result.success) {
          successCount++;
          console.log(`✓ Imported ${result.chaptersCreated} chapters for ${bookData.title}`);
        } else {
          failedCount++;
          errorList.push(`${bookData.title}: ${result.error}`);
        }

      } catch (error: any) {
        failedCount++;
        errorList.push(`${bookData.title}: ${error.message}`);
        console.error(`✗ Error with ${bookData.title}:`, error);
      }

      // Small delay to avoid rate limiting
      if (i < GUTENBERG_BOOKS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    setResults({ success: successCount, failed: failedCount, errors: errorList });
    setIsComplete(true);
    setIsRunning(false);
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Library Setup</h1>
          <p className="text-muted-foreground">
            One-time setup to populate the library with {GUTENBERG_BOOKS.length} classic books
          </p>
        </div>

        {!isRunning && !isComplete && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">What This Will Do:</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Add {GUTENBERG_BOOKS.length} classic books to the library</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Import full text content from Project Gutenberg</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Split into readable chapters with proper paragraphs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Make all books immediately readable</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="space-y-1">
                    <li>• This will take approximately 2-3 minutes</li>
                    <li>• Keep this tab open until complete</li>
                    <li>• Only needs to be run once</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={setupAllBooks}
              size="lg"
              className="w-full"
            >
              Start Library Setup
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold mb-1">Setting up library...</p>
              <p className="text-sm text-muted-foreground">
                {progress.current} / {progress.total} books
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>

            {progress.currentBook && (
              <div className="text-center text-sm text-muted-foreground">
                Currently importing: <strong>{progress.currentBook}</strong>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center text-sm text-amber-800 dark:text-amber-200">
              Please keep this tab open until the process completes
            </div>
          </div>
        )}

        {isComplete && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Setup Complete! 🎉</h2>
              <p className="text-muted-foreground">
                Your library is now fully populated and ready to use
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-500">{results.success}</div>
                  <div className="text-sm text-muted-foreground">Books Imported</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{results.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View Errors ({results.errors.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-red-500">
                    {results.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = "/library"}
                size="lg"
                className="flex-1"
              >
                Go to Library
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                Run Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

