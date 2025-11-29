import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ThumbsUp, Plus, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useDiscussions } from "@/hooks/useDiscussions";
import { CreateDiscussionDialog } from "@/components/discussions/CreateDiscussionDialog";
import { cn } from "@/lib/utils";

const Discussions = () => {
  const [filter, setFilter] = useState<"all" | "solo" | "group" | "communal">("all");
  const { data: discussions, isLoading } = useDiscussions();

  const filteredDiscussions = discussions
    ? filter === "all"
      ? discussions
      : discussions.filter((d) => d.discussion_type === filter)
    : [];

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-reading text-2xl font-semibold text-card-foreground">
              Discussions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join conversations about your favorite books
            </p>
          </div>

          <CreateDiscussionDialog>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </CreateDiscussionDialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "solo", "group", "communal"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "soft"}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize shrink-0"
            >
              {type === "all" ? "All Discussions" : type}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Discussions List */}
            <div className="space-y-4">
              {filteredDiscussions.map((discussion, index) => (
                <Link
                  key={discussion.id}
                  to={`/discussions/${discussion.id}`}
                  className={cn(
                    "block bg-card rounded-xl p-5 border border-border shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up",
                    index === 1 && "animation-delay-100",
                    index === 2 && "animation-delay-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0",
                        discussion.discussion_type === "solo" && "bg-primary",
                        discussion.discussion_type === "group" && "bg-secondary",
                        discussion.discussion_type === "communal" && "bg-amber-100"
                      )}
                    >
                      💬
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-card-foreground line-clamp-2">
                        {discussion.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {discussion.books?.title} • by {discussion.profiles?.username}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {discussion.upvotes}
                        </span>
                        <span
                          className={cn(
                            "capitalize px-2 py-0.5 rounded-full",
                            discussion.discussion_type === "solo" && "bg-primary",
                            discussion.discussion_type === "group" && "bg-secondary",
                            discussion.discussion_type === "communal" && "bg-amber-100 text-amber-800"
                          )}
                        >
                          {discussion.discussion_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredDiscussions.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No discussions yet. Start the first one!</p>
                <CreateDiscussionDialog>
                  <Button className="mt-4">Start a Discussion</Button>
                </CreateDiscussionDialog>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Discussions;
