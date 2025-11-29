import { Link } from "react-router-dom";
import { Lock, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book } from "@/hooks/useBooks";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link to={`/read/${book.id}`} className="group">
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
  );
}
