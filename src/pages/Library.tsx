import { useState } from "react";
import { Search, Grid, List, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBooks } from "@/hooks/useBooks";
import { BookCard } from "@/components/library/BookCard";
import { BookListItem } from "@/components/library/BookListItem";
import { AuthorCatalogue } from "@/components/library/AuthorCatalogue";

type ContentFilter = "all" | "novel" | "play" | "poem";

const Library = () => {
  const [search, setSearch] = useState("");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  
  const { data: books, isLoading } = useBooks();

  const filterBooks = (category: string) => {
    if (!books) return [];
    return books.filter((book) => {
      const matchesCategory = category === "all" || book.category === category;
      const matchesContent = contentFilter === "all" || book.content_type === contentFilter;
      const matchesSearch =
        search === "" ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesAuthor = !selectedAuthor || book.author.toLowerCase().includes(selectedAuthor.toLowerCase());
      return matchesCategory && matchesContent && matchesSearch && matchesAuthor;
    });
  };

  const handleAuthorSelect = (author: string) => {
    setSelectedAuthor(selectedAuthor === author ? null : author);
    setSearch("");
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

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar with Author Catalogue */}
          <aside className="hidden md:block w-64 shrink-0">
            <AuthorCatalogue 
              onAuthorSelect={handleAuthorSelect}
              selectedAuthor={selectedAuthor}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={selectedAuthor ? `Search ${selectedAuthor}'s works...` : "Search books..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>

              {selectedAuthor && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtering by:</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAuthor(null)}
                    className="gap-1"
                  >
                    {selectedAuthor}
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto">
                  {(["all", "novel", "play", "poem"] as ContentFilter[]).map((filter) => (
                    <Button
                      key={filter}
                      variant={contentFilter === filter ? "default" : "soft"}
                      size="sm"
                      onClick={() => setContentFilter(filter)}
                      className="capitalize shrink-0"
                    >
                      {filter === "all" ? "All Types" : `${filter}s`}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-1 ml-2">
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
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="w-full bg-card border border-border">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="classic" className="flex-1">Classic</TabsTrigger>
                <TabsTrigger value="contemporary" className="flex-1">Contemporary</TabsTrigger>
                <TabsTrigger value="subscriber" className="flex-1">Community</TabsTrigger>
              </TabsList>

              {["all", "classic", "contemporary", "subscriber"].map((category) => (
                <TabsContent key={category} value={category} className="mt-6">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filterBooks(category).map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filterBooks(category).map((book) => (
                        <BookListItem key={book.id} book={book} />
                      ))}
                    </div>
                  )}

                  {filterBooks(category).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No books found matching your criteria.
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Library;
