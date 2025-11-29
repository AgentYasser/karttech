import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mic, Plus, Users, Loader2, BookOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscussionRooms, RoomStatus } from "@/hooks/useDiscussionRooms";
import { CreateRoomDialog } from "@/components/audio/CreateRoomDialog";
import { AudioRoom } from "@/components/audio/AudioRoom";
import { cn } from "@/lib/utils";

const AudioRooms = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState<"live" | "ended">("live");
  
  const { data: liveRooms, isLoading: liveLoading } = useDiscussionRooms("live");
  const { data: endedRooms, isLoading: endedLoading } = useDiscussionRooms("ended");

  // If we have a roomId, show the room
  if (roomId) {
    return (
      <MainLayout>
        <AudioRoom roomId={roomId} />
      </MainLayout>
    );
  }

  const isLoading = activeTab === "live" ? liveLoading : endedLoading;
  const rooms = activeTab === "live" ? liveRooms : endedRooms;

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-reading text-2xl font-semibold text-card-foreground">
              Audio Discussions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live voice discussions about books
            </p>
          </div>

          <CreateRoomDialog>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Start Discussion
            </Button>
          </CreateRoomDialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "live" | "ended")}>
          <TabsList className="w-full bg-card border border-border mb-6">
            <TabsTrigger value="live" className="flex-1 gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="ended" className="flex-1">
              Past Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <Link
                    key={room.id}
                    to={`/audio-rooms/${room.id}`}
                    className={cn(
                      "block bg-card rounded-xl p-5 border border-border shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up",
                      index === 1 && "animation-delay-100",
                      index === 2 && "animation-delay-200"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                        <Mic className="w-6 h-6 text-primary-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-card-foreground truncate">
                            {room.title}
                          </h3>
                          <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        
                        {room.books?.title && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {room.books.title}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Live
                          </span>
                          <span>
                            Started by {room.profiles?.username || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <Button variant="default" size="sm">
                        Join
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No live discussions right now</p>
                <CreateRoomDialog>
                  <Button className="mt-4">Start the First One</Button>
                </CreateRoomDialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-card rounded-xl p-5 border border-border shadow-soft"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Mic className="w-6 h-6 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-card-foreground truncate">
                          {room.title}
                        </h3>
                        
                        {room.books?.title && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {room.books.title}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>
                            Ended {room.ended_at && new Date(room.ended_at).toLocaleDateString()}
                          </span>
                          <span>
                            By {room.profiles?.username || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Ended
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No past discussions yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AudioRooms;
