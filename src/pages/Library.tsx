import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Grid, List, Lock, Clock, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockBooks } from "@/data/mockData";
import { cn } from "@/lib/utils";

type ContentFilter = "all" | "novel" | "play" | "poem";

const Library = () => {
  const [search, setSearch] = useState("");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filterBooks = (category: string) => {
    return mockBooks.filter((book) => {
      const matchesCategory = category === "all" || book.category === category;
      const matchesContent = contentFilter === "all" || book.contentType === contentFilter;
      const matchesSearch =
        search === "" ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesContent && matchesSearch;
    });
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
    </MainLayout>
  );
};

function BookCard({ book }: { book: typeof mockBooks[0] }) {
  return (
    <Link to={`/book/${book.id}`} className="group">
      <div className="relative">
        <div
          className={cn(
            "w-full aspect-[3/4] rounded-xl flex items-center justify-center text-4xl shadow-card transition-all duration-300 group-hover:shadow-hover group-hover:-translate-y-1",
            book.category === "classic" && "bg-gradient-to-br from-amber-50 to-amber-100",
            book.category === "contemporary" && "bg-gradient-to-br from-blue-50 to-blue-100",
            book.category === "subscriber" && "bg-gradient-to-br from-green-50 to-green-100"
          )}
        >
          {book.contentType === "novel" && "📚"}
          {book.contentType === "play" && "🎭"}
          {book.contentType === "poem" && "📜"}
        </div>

        {book.isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs text-amber-800">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}

        {book.requiresPoints && (
          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs border border-border">
            <Lock className="w-3 h-3" />
            {book.pointsCost}
          </div>
        )}

        {book.earlyAccessUntil && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center justify-center gap-1 text-xs text-amber-800">
            <Clock className="w-3 h-3" />
            Early Access
          </div>
        )}
      </div>

      <h3 className="font-reading text-sm font-medium text-card-foreground mt-3 line-clamp-2">
        {book.title}
      </h3>
      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
    </Link>
  );
}

function BookListItem({ book }: { book: typeof mockBooks[0] }) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="flex gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300"
    >
      <div
        className={cn(
          "w-16 h-24 rounded-lg flex items-center justify-center text-2xl shrink-0",
          book.category === "classic" && "bg-gradient-to-br from-amber-50 to-amber-100",
          book.category === "contemporary" && "bg-gradient-to-br from-blue-50 to-blue-100",
          book.category === "subscriber" && "bg-gradient-to-br from-green-50 to-green-100"
        )}
      >
        {book.contentType === "novel" && "📚"}
        {book.contentType === "play" && "🎭"}
        {book.contentType === "poem" && "📜"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-reading font-medium text-card-foreground line-clamp-1">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>

          {book.requiresPoints && (
            <div className="shrink-0 bg-muted px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              {book.pointsCost}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {book.description}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="capitalize">{book.contentType}</span>
          <span>•</span>
          <span>{Math.round(book.estimatedReadingTime / 60)}h read</span>
          {book.isFeatured && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Library;
