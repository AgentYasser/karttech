import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Lock, BookOpen, Loader2, LogOut } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinGroup, useLeaveGroup, useGroupMembers } from "@/hooks/useGroups";
import { useAwardPoints } from "@/hooks/usePoints";
import { toast } from "sonner";

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const awardPoints = useAwardPoints();

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_groups")
        .select(`
          *,
          books(id, title, author, cover_image_url),
          creator:profiles!reading_groups_created_by_fkey(username)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: members } = useGroupMembers(id);

  const { data: chapters } = useQuery({
    queryKey: ["book_chapters", group?.book_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("id")
        .eq("book_id", group?.book_id);

      if (error) throw error;
      return data;
    },
    enabled: !!group?.book_id,
  });

  const isMember = members?.some((m) => m.user_id === user?.id);
  const totalChapters = chapters?.length || 20;
  const progress = Math.round(((group?.current_chapter || 1) / totalChapters) * 100);

  const handleJoinGroup = async () => {
    try {
      await joinGroup.mutateAsync(id!);
      awardPoints.mutate({ source: "group_joined" });
      toast.success("Joined group successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup.mutateAsync(id!);
      toast.success("Left group successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground">Group not found</p>
          <Link to="/groups">
            <Button variant="soft" className="mt-4">
              Back to Groups
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <Link to="/groups" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>

        {/* Group Info */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-soft mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-3xl shrink-0">
              📚
            </div>
            <div className="flex-1">
              <h1 className="font-reading text-xl font-semibold text-card-foreground flex items-center gap-2">
                {group.name}
                {group.is_private && <Lock className="w-4 h-4 text-muted-foreground" />}
              </h1>
              <p className="text-sm text-muted-foreground">
                Created by {group.creator?.username}
              </p>
            </div>
          </div>

          {group.description && (
            <p className="text-card-foreground mb-4">{group.description}</p>
          )}

          {/* Current Book */}
          {group.books && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Currently Reading</p>
              <p className="font-medium text-card-foreground">{group.books.title}</p>
              <p className="text-sm text-muted-foreground">{group.books.author}</p>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Chapter {group.current_chapter} of {totalChapters}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Link to={`/read/${group.books.id}`}>
                <Button variant="soft" size="sm" className="mt-3 gap-2">
                  <BookOpen className="w-4 h-4" />
                  Continue Reading
                </Button>
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isMember ? (
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                disabled={leaveGroup.isPending}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Group
              </Button>
            ) : (
              <Button
                onClick={handleJoinGroup}
                disabled={joinGroup.isPending}
              >
                Join Group
              </Button>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
          <h2 className="font-medium text-card-foreground flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" />
            Members ({members?.length || 0}/{group.max_members})
          </h2>

          <div className="space-y-3">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {member.profiles?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-card-foreground text-sm">
                    {member.profiles?.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
