import { Link } from "react-router-dom";
import { Lock, Clock, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book, useBookHasContent } from "@/hooks/useBooks";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { data: hasContent } = useBookHasContent(book.id);
  
  // If no content, show "Coming Soon" overlay
  const showComingSoon = hasContent === false;

  return (
    <div className="group relative">
      {showComingSoon ? (
        <div className="relative">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full aspect-[3/4] rounded-xl object-cover shadow-card opacity-50"
            />
          ) : (
            <div
              className={cn(
                "w-full aspect-[3/4] rounded-xl flex items-center justify-center text-4xl shadow-card opacity-50",
                book.category === "classic" && "bg-gradient-to-br from-amber-50 to-amber-100",
                book.category === "contemporary" && "bg-gradient-to-br from-blue-50 to-blue-100",
                book.category === "subscriber" && "bg-gradient-to-br from-green-50 to-green-100"
              )}
            >
              {book.content_type === "novel" && "📚"}
              {book.content_type === "play" && "🎭"}
              {book.content_type === "poem" && "📜"}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="text-center p-4">
              <AlertCircle className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-semibold">Coming Soon</p>
              <p className="text-white/80 text-xs mt-1">Content will be available shortly</p>
            </div>
          </div>
        </div>
      ) : (
        <Link to={`/read/${book.id}`} className="block">
      <div className="relative">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full aspect-[3/4] rounded-xl object-cover shadow-card transition-all duration-300 group-hover:shadow-hover group-hover:-translate-y-1"
          />
        ) : (
          <div
            className={cn(
              "w-full aspect-[3/4] rounded-xl flex items-center justify-center text-4xl shadow-card transition-all duration-300 group-hover:shadow-hover group-hover:-translate-y-1",
              book.category === "classic" && "bg-gradient-to-br from-amber-50 to-amber-100",
              book.category === "contemporary" && "bg-gradient-to-br from-blue-50 to-blue-100",
              book.category === "subscriber" && "bg-gradient-to-br from-green-50 to-green-100"
            )}
          >
            {book.content_type === "novel" && "📚"}
            {book.content_type === "play" && "🎭"}
            {book.content_type === "poem" && "📜"}
          </div>
        )}

        {book.is_featured && (
          <div className="absolute top-2 left-2 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs text-amber-800">
            <Sparkles className="w-3 h-3" />
            Featured
          </div>
        )}

        {book.requires_points && (
          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs border border-border">
            <Lock className="w-3 h-3" />
            {book.points_cost}
          </div>
        )}

        {book.early_access_until && (
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
      )}
    </div>
  );
}
