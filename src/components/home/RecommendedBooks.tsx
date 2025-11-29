import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Lock, Clock } from "lucide-react";
import { mockBooks } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function RecommendedBooks() {
  const featuredBooks = mockBooks.filter((b) => b.isFeatured).slice(0, 4);

  return (
    <div className="animate-fade-up animation-delay-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-medium text-card-foreground">Recommended</h2>
        </div>
        <Link
          to="/library"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {featuredBooks.map((book) => (
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            className="shrink-0 w-36 group"
          >
            <div className="relative">
              <div
                className={cn(
                  "w-36 h-48 rounded-xl flex items-center justify-center text-4xl shadow-card transition-all duration-300 group-hover:shadow-hover group-hover:-translate-y-1",
                  book.category === "classic" && "bg-gradient-to-br from-amber-50 to-amber-100",
                  book.category === "contemporary" && "bg-gradient-to-br from-blue-50 to-blue-100",
                  book.category === "subscriber" && "bg-gradient-to-br from-green-50 to-green-100"
                )}
              >
                📚
              </div>

              {book.requiresPoints && (
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs border border-border">
                  <Lock className="w-3 h-3" />
                  {book.pointsCost}
                </div>
              )}

              {book.earlyAccessUntil && (
                <div className="absolute bottom-2 left-2 right-2 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs text-amber-800">
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
        ))}
      </div>
    </div>
  );
}
