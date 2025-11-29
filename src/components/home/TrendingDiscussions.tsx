import { Link } from "react-router-dom";
import { MessageCircle, ThumbsUp, ChevronRight, Loader2 } from "lucide-react";
import { useDiscussions } from "@/hooks/useDiscussions";

export function TrendingDiscussions() {
  const { data: discussions, isLoading } = useDiscussions();
  const topDiscussions = discussions?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="animate-fade-up animation-delay-300">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-foreground" />
          <h2 className="font-medium text-card-foreground">Trending Discussions</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (topDiscussions.length === 0) {
    return (
      <div className="animate-fade-up animation-delay-300">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-foreground" />
          <h2 className="font-medium text-card-foreground">Discussions</h2>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <p className="text-muted-foreground text-sm">
            No discussions yet. Start reading and share your thoughts!
          </p>
          <Link to="/discussions" className="text-sm text-foreground font-medium mt-2 inline-block hover:underline">
            Start a Discussion
          </Link>
        </div>
      </div>
    );
  }

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
        {topDiscussions.map((discussion) => (
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
                  {discussion.books?.title} • by {discussion.profiles?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {discussion.upvotes}
              </span>
              <span className="capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {discussion.discussion_type}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
