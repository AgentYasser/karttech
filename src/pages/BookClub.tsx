/**
 * Book Club - Live Audio Discussions
 * Replaces Audio Rooms with full book club functionality
 * Implements Claude/Anti Gravity specifications
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Users, Plus, Loader2, BookOpen, Share2, MessageCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscussionRooms } from "@/hooks/useDiscussionRooms";
import { CreateBookClubDialog } from "@/components/bookclub/CreateBookClubDialog";
import { AudioRoom } from "@/components/audio/AudioRoom";
import { cn } from "@/lib/utils";

const BookClub = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState<"browse" | "my-clubs" | "live">("browse");
  
  const { data: liveRooms, isLoading: liveLoading } = useDiscussionRooms("live");
  const { data: allRooms, isLoading: allLoading } = useDiscussionRooms(undefined);

  // If we have a roomId, show the audio discussion interface
  if (roomId) {
    return (
      <MainLayout>
        <AudioRoom roomId={roomId} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-reading text-2xl font-semibold text-card-foreground">
              Book Club
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join live audio discussions about your favorite books
            </p>
          </div>

          <CreateBookClubDialog>
            <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4" />
              Start Discussion
            </Button>
          </CreateBookClubDialog>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">How Book Club Works</p>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li>Create a discussion for any book with scheduled date/time</li>
                <li>Set max participants (2-50) and moderate the conversation</li>
                <li>Share the club link on WhatsApp, Telegram, Instagram, Discord</li>
                <li>Join live audio at scheduled time to discuss the book together</li>
                <li>Moderators control muting, speaking order, and can record sessions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Three Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="w-full bg-card border border-border">
            <TabsTrigger value="browse" className="flex-1">Browse Clubs</TabsTrigger>
            <TabsTrigger value="my-clubs" className="flex-1">My Clubs</TabsTrigger>
            <TabsTrigger value="live" className="flex-1 gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </TabsTrigger>
          </TabsList>

          {/* Browse Clubs Tab */}
          <TabsContent value="browse">
            {allLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : allRooms && allRooms.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  All upcoming and scheduled book club discussions
                </p>
                {allRooms.map((room, index) => (
                  <Link
                    key={room.id}
                    to={`/book-club/${room.id}`}
                    className={cn(
                      "block bg-card rounded-xl p-5 border border-border shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up",
                      index === 1 && "animation-delay-100",
                      index === 2 && "animation-delay-200"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-amber-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-card-foreground truncate">
                            {room.title}
                          </h3>
                          {room.status === "live" && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                        
                        {room.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {room.description}
                          </p>
                        )}

                        {room.books?.title && (
                          <p className="text-sm text-amber-700 mt-1 flex items-center gap-1 font-medium">
                            <BookOpen className="w-3.5 h-3.5" />
                            {room.books.title}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>
                            Hosted by {room.profiles?.username || "Unknown"}
                          </span>
                          {room.status === "live" && (
                            <span className="text-red-600 font-medium">LIVE NOW</span>
                          )}
                        </div>
                      </div>

                      <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
                        {room.status === "live" ? "Join Now" : "View Details"}
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No book clubs yet</p>
                <CreateBookClubDialog>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Start the First Book Club
                  </Button>
                </CreateBookClubDialog>
              </div>
            )}
          </TabsContent>

          {/* My Clubs Tab */}
          <TabsContent value="my-clubs">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your created and joined book clubs will appear here</p>
              <p className="text-xs text-muted-foreground mt-2">Create or join a club to get started</p>
            </div>
          </TabsContent>

          {/* Live Now Tab */}
          <TabsContent value="live">
            {liveLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : liveRooms && liveRooms.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800 font-medium">
                    🔴 {liveRooms.length} active discussion{liveRooms.length > 1 ? "s" : ""} happening now
                  </p>
                </div>
                {liveRooms.map((room, index) => (
                  <Link
                    key={room.id}
                    to={`/book-club/${room.id}`}
                    className={cn(
                      "block bg-red-50 rounded-xl p-5 border-2 border-red-300 shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up",
                      index === 1 && "animation-delay-100"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-card-foreground truncate">
                            {room.title}
                          </h3>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        </div>
                        
                        {room.books?.title && (
                          <p className="text-sm text-red-700 mt-1 flex items-center gap-1 font-medium">
                            <BookOpen className="w-3.5 h-3.5" />
                            {room.books.title}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Live Discussion
                          </span>
                        </div>
                      </div>

                      <Button variant="destructive" size="sm">
                        Join Live
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 text-muted-foreground mx-auto mb-4">📚</div>
                <p className="text-muted-foreground">No live discussions right now</p>
                <CreateBookClubDialog>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">Start a Live Discussion</Button>
                </CreateBookClubDialog>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BookClub;

