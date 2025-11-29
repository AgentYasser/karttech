import { useState } from "react";
import { ChevronRight, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELESS_AUTHORS = {
  classic_fiction: {
    label: "Classic Fiction",
    authors: ["Jane Austen", "Charles Dickens", "Mark Twain", "Charlotte Brontë", "Fyodor Dostoevsky", "Leo Tolstoy"],
  },
  drama_poetry: {
    label: "Drama & Poetry",
    authors: ["William Shakespeare", "Homer", "Dante Alighieri", "John Milton", "Walt Whitman"],
  },
  philosophy_essays: {
    label: "Philosophy & Essays",
    authors: ["Plato", "Marcus Aurelius", "Henry David Thoreau", "Ralph Waldo Emerson"],
  },
  adventure_mystery: {
    label: "Adventure & Mystery",
    authors: ["Jules Verne", "Arthur Conan Doyle", "Edgar Allan Poe", "Robert Louis Stevenson", "Jack London"],
  },
};

interface AuthorCatalogueProps {
  onAuthorSelect: (author: string) => void;
  selectedAuthor: string | null;
}

export function AuthorCatalogue({ onAuthorSelect, selectedAuthor }: AuthorCatalogueProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("classic_fiction");

  return (
    <div className="space-y-2">
      <h3 className="font-reading text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
        Timeless Authors
      </h3>
      
      <div className="space-y-1">
        {Object.entries(TIMELESS_AUTHORS).map(([key, { label, authors }]) => (
          <div key={key} className="bg-card rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted/50 transition-colors"
            >
              <span>{label}</span>
              <ChevronRight 
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  expandedCategory === key && "rotate-90"
                )} 
              />
            </button>
            
            {expandedCategory === key && (
              <div className="px-2 pb-2 space-y-0.5">
                {authors.map((author) => (
                  <button
                    key={author}
                    onClick={() => onAuthorSelect(author)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      selectedAuthor === author
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{author}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
