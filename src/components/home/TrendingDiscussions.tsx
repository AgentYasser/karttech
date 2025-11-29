import { Link } from "react-router-dom";
import { MessageCircle, ThumbsUp, Mic, ChevronRight } from "lucide-react";
import { mockDiscussions, mockBooks } from "@/data/mockData";

export function TrendingDiscussions() {
  const discussions = mockDiscussions.slice(0, 3);

  return (
    <div className="animate-fade-up animation-delay-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-foreground" />
          <h2 className="font-medium text-card-foreground">Trending Discussions</h2>
        </div>
        <Link
          to="/discussions"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {discussions.map((discussion) => {
          const book = mockBooks.find((b) => b.id === discussion.bookId);

          return (
            <Link
              key={discussion.id}
              to={`/discussions/${discussion.id}`}
              className="block bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-card-foreground line-clamp-1">
                    {discussion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {book?.title} • by {discussion.authorUsername}
                  </p>
                </div>

                {discussion.hasAudio && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Mic className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {discussion.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {discussion.messageCount}
                </span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {discussion.discussionType}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
