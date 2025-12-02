import { Users, Plus, Lock, Loader2, LogOut, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useGroups, useJoinGroup, useLeaveGroup } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useAwardPoints } from "@/hooks/usePoints";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Groups = () => {
  const navigate = useNavigate();
  const { data: groups, isLoading } = useGroups();
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const { toast } = useToast();
  const { user } = useAuth();
  const awardPoints = useAwardPoints();
  const [search, setSearch] = useState("");

  // Get user's memberships
  const { data: memberships } = useQuery({
    queryKey: ["user_memberships", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((m) => m.group_id);
    },
    enabled: !!user,
  });

  const handleJoinGroup = async (groupId: string) => {
    try {
      // Join the group
      await joinGroup.mutateAsync(groupId);
      
      // Award points
      awardPoints.mutate({ source: "group_joined" });
      
      // Success feedback
      toast({
        title: "Welcome to the group! 🎉",
        description: "You've successfully joined. Check out what everyone's reading!",
      });
      
      // Navigate to group detail page (show what they joined)
      navigate(`/groups/${groupId}`);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup.mutateAsync(groupId);
      toast({
        title: "Left group",
        description: "You've left the reading group.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave group",
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups?.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.books?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="font-reading text-2xl font-semibold text-card-foreground">
              Reading Groups
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Read together, grow together
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CreateGroupDialog>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </CreateGroupDialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Groups List */}
            <div className="space-y-4">
              {filteredGroups?.map((group, index) => {
                const totalChapters = 20;
                const progress = Math.round((group.current_chapter / totalChapters) * 100);
                const isMember = memberships?.includes(group.id);

                return (
                  <div
                    key={group.id}
                    className="bg-card rounded-xl p-5 border border-border shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-2xl shrink-0">
                        📚
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-card-foreground flex items-center gap-2">
                              {group.name}
                              {group.is_private && (
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                              {isMember && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Member
                                </span>
                              )}
                              {/* New Badge */}
                              {new Date(group.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  New
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Reading: {group.books?.title || "No book selected"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>
                              Chapter {group.current_chapter} of {totalChapters}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {group.member_count}/{group.max_members} members
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {isMember ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={leaveGroup.isPending}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Leave
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joinGroup.isPending}
                        >
                          Join Group
                        </Button>
                      )}
                      <Link to={`/groups/${group.id}`} className="flex-1">
                        <Button variant="soft" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {(!groups || groups.length === 0) && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No groups available yet.</p>
                <CreateGroupDialog>
                  <Button className="mt-4">Create a Group</Button>
                </CreateGroupDialog>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Groups;
