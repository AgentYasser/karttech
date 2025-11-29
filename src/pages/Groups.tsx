import { useState } from "react";
import { Users, Plus, Calendar, Lock, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGroups, useJoinGroup } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";

const Groups = () => {
  const { data: groups, isLoading } = useGroups();
  const joinGroup = useJoinGroup();
  const { toast } = useToast();

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup.mutateAsync(groupId);
      toast({
        title: "Joined!",
        description: "You've successfully joined the reading group.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-reading text-2xl font-semibold text-card-foreground">
              Reading Groups
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Read together, grow together
            </p>
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Groups List */}
            <div className="space-y-4">
              {groups?.map((group, index) => {
                const totalChapters = 20; // Placeholder
                const progress = Math.round((group.current_chapter / totalChapters) * 100);

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
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={joinGroup.isPending}
                      >
                        Join Group
                      </Button>
                      <Button variant="soft" size="sm" className="flex-1">
                        View Details
                      </Button>
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
                <Button className="mt-4">Create a Group</Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Groups;
