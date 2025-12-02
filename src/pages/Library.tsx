// Enhanced Library component with literary categorization
import { useState } from "react";
import { Search, Grid, List, Loader2, BookOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBooks } from "@/hooks/useBooks";
import { BookCard } from "@/components/library/BookCard";
import { BookListItem } from "@/components/library/BookListItem";
import { BookSuggestionModal } from "@/components/library/BookSuggestionModal";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type BrowseMode = "category" | "literary" | "author";

// Literary categories for navigation
const LITERARY_CATEGORIES = [
  "All",
  "Literary Fiction",
  "Science Fiction & Fantasy",
  "Mystery & Thriller",
  "Romance",
  "Historical Fiction",
  "Poetry & Drama",
  "Non-Fiction",
  "Biography & Memoir",
  "Philosophy & Essays",
];

const LibraryEnhanced = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [browseMode, setBrowseMode] = useState<BrowseMode>("category");
  const [selectedLiteraryCategory, setSelectedLiteraryCategory] = useState("All");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const { data: books, isLoading } = useBooks();

  // Get unique authors
  const authors = books
    ? Array.from(new Set(books.map(b => b.author))).sort()
    : [];

  const filterBooks = (category?: string) => {
    if (!books) return [];
    return books.filter((book) => {
      // Category filter (classic/contemporary/subscriber)
      const matchesCategory = !category || category === "all" || book.category === category;

      // Literary category filter - check if book has literary_category field
      // If not available, we'll use content_type as fallback
      const bookLiteraryCategory = (book as any).literary_category;
      const matchesLiterary =
        selectedLiteraryCategory === "All" ||
        bookLiteraryCategory === selectedLiteraryCategory ||
        // Combine Sci-Fi & Fantasy
        (selectedLiteraryCategory === "Science Fiction & Fantasy" &&
          (bookLiteraryCategory === "Science Fiction" || bookLiteraryCategory === "Fantasy")) ||
        // Combine Poetry & Drama
        (selectedLiteraryCategory === "Poetry & Drama" &&
          (bookLiteraryCategory === "Poetry" || bookLiteraryCategory === "Drama & Plays")) ||
        // Fallback: if literary_category doesn't exist, match by content_type
        (!bookLiteraryCategory && selectedLiteraryCategory === "Poetry & Drama" && book.content_type === "poem");

      // Author filter
      const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;

      // Search filter
      const matchesSearch =
        search === "" ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.description?.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesLiterary && matchesAuthor && matchesSearch;
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  const filteredBooks = filterBooks();

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-reading font-bold text-card-foreground mb-2">
                📚 Library
              </h1>
              <p className="text-muted-foreground">
                {books?.length || 0} books across classic and contemporary literature
              </p>
            </div>
            <BookSuggestionModal />
          </div>
        </div>

        {/* Browse Mode Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={browseMode === "category" ? "default" : "soft"}
            size="sm"
            onClick={() => {
              setBrowseMode("category");
              setSelectedLiteraryCategory("All");
              setSelectedAuthor(null);
            }}
          >
            By Era
          </Button>
          <Button
            variant={browseMode === "literary" ? "default" : "soft"}
            size="sm"
            onClick={() => {
              setBrowseMode("literary");
              setSelectedAuthor(null);
            }}
          >
            By Genre
          </Button>
          <Button
            variant={browseMode === "author" ? "default" : "soft"}
            size="sm"
            onClick={() => {
              setBrowseMode("author");
              setSelectedLiteraryCategory("All");
            }}
          >
            By Author
          </Button>
        </div>

        {/* Search and View Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedAuthor || selectedLiteraryCategory !== "All") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {selectedAuthor && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAuthor(null)}
                  className="gap-1"
                >
                  {selectedAuthor}
                  <span className="text-xs">×</span>
                </Button>
              )}
              {selectedLiteraryCategory !== "All" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedLiteraryCategory("All")}
                  className="gap-1"
                >
                  {selectedLiteraryCategory}
                  <span className="text-xs">×</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Browse by Category (Era) */}
        {browseMode === "category" && (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="w-full bg-card border border-border">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="classic" className="flex-1">Classic</TabsTrigger>
              <TabsTrigger value="contemporary" className="flex-1">Contemporary</TabsTrigger>
              <TabsTrigger value="subscriber" className="flex-1">Community</TabsTrigger>
            </TabsList>

            {["all", "classic", "contemporary", "subscriber"].map((category) => (
              <TabsContent key={category} value={category}>
                <BookGrid books={filterBooks(category)} viewMode={viewMode} />
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Browse by Literary Category (Genre) */}
        {browseMode === "literary" && (
          <div className="space-y-6">
            {/* Literary category pills */}
            <div className="flex flex-wrap gap-2">
              {LITERARY_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedLiteraryCategory === cat ? "default" : "soft"}
                  size="sm"
                  onClick={() => setSelectedLiteraryCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <BookGrid books={filteredBooks} viewMode={viewMode} />
          </div>
        )}

        {/* Browse by Author */}
        {browseMode === "author" && (
          <div className="space-y-6">
            {/* Author grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {authors.map((author) => {
                const authorBooks = books?.filter(b => b.author === author) || [];
                return (
                  <button
                    key={author}
                    onClick={() => {
                      const newAuthor = selectedAuthor === author ? null : author;
                      setSelectedAuthor(newAuthor);
                      // Clear other filters when selecting author
                      if (newAuthor) {
                        setSelectedLiteraryCategory("All");
                        setSearch("");
                      }
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                      selectedAuthor === author
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="font-medium text-sm text-card-foreground line-clamp-2">
                        {author}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {authorBooks.length} {authorBooks.length === 1 ? 'book' : 'books'}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedAuthor && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-reading font-semibold">
                    Books by {selectedAuthor}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAuthor(null)}
                  >
                    Clear
                  </Button>
                </div>
                {filteredBooks.length > 0 ? (
                  <BookGrid books={filteredBooks} viewMode={viewMode} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No books found for {selectedAuthor}.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Helper component for book display
function BookGrid({ books, viewMode }: { books: any[]; viewMode: ViewMode }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No books found matching your criteria.</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookListItem key={book.id} book={book} />
      ))}
    </div>
  );
}

export default LibraryEnhanced;
