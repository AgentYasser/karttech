import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book } from "@/hooks/useBooks";

interface BookListItemProps {
  book: Book;
}

export function BookListItem({ book }: BookListItemProps) {
  return (
    <Link
      to={`/read/${book.id}`}
      className="flex gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300"
    >
      {book.cover_image_url ? (
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="w-16 h-24 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div
          className={cn(
            "w-16 h-24 rounded-lg flex items-center justify-center text-2xl shrink-0",
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

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-reading font-medium text-card-foreground line-clamp-1">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>

          {book.requires_points && (
            <div className="shrink-0 bg-muted px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              {book.points_cost}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {book.description}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="capitalize">{book.content_type}</span>
          <span>•</span>
          <span>{Math.round(book.estimated_reading_time / 60)}h read</span>
          {book.is_featured && (
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
