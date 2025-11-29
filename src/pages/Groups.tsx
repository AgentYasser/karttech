import { Link } from "react-router-dom";
import { Users, Plus, BookOpen, Calendar, Lock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockBooks } from "@/data/mockData";

const mockGroups = [
  {
    id: "1",
    name: "Pride & Prejudice Book Club",
    bookId: "1",
    memberCount: 24,
    maxMembers: 50,
    currentChapter: 15,
    totalChapters: 61,
    isPrivate: false,
    nextSession: "Tomorrow at 7PM",
  },
  {
    id: "2",
    name: "Classic Literature Enthusiasts",
    bookId: "2",
    memberCount: 45,
    maxMembers: 50,
    currentChapter: 8,
    totalChapters: 9,
    isPrivate: false,
    nextSession: "Saturday at 3PM",
  },
  {
    id: "3",
    name: "Private Shakespeare Study",
    bookId: "3",
    memberCount: 12,
    maxMembers: 20,
    currentChapter: 3,
    totalChapters: 5,
    isPrivate: true,
    nextSession: null,
  },
];

const Groups = () => {
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

        {/* Groups List */}
        <div className="space-y-4">
          {mockGroups.map((group, index) => {
            const book = mockBooks.find((b) => b.id === group.bookId);
            const progress = Math.round((group.currentChapter / group.totalChapters) * 100);

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
                          {group.isPrivate && (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Reading: {book?.title}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>
                          Chapter {group.currentChapter} of {group.totalChapters}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                      {group.nextSession && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {group.nextSession}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex-1">
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
        {mockGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No groups available.</p>
            <Button className="mt-4">Create a Group</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Groups;
