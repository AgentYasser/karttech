import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, PhoneOff, MessageSquare, Users, X, Wifi, WifiOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticipantCard } from "./ParticipantCard";
import { RoomChat } from "./RoomChat";
import {
  useDiscussionRoom,
  useRoomParticipants,
  useJoinRoom,
  useLeaveRoom,
  useUpdateMuteStatus,
  usePromoteToModerator,
  useEndRoom,
} from "@/hooks/useDiscussionRooms";
import { useAuth } from "@/contexts/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AudioRoomProps {
  roomId: string;
}

export function AudioRoom({ roomId }: AudioRoomProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const { data: room, isLoading: roomLoading } = useDiscussionRoom(roomId);
  const { data: participants, refetch: refetchParticipants } = useRoomParticipants(roomId);
  
  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();
  const updateMute = useUpdateMuteStatus();
  const promoteMod = usePromoteToModerator();
  const endRoom = useEndRoom();

  const currentParticipant = participants?.find(p => p.user_id === user?.id);
  const isCreator = room?.created_by === user?.id;
  const isModerator = currentParticipant?.role === "moderator" || currentParticipant?.role === "creator";

  // WebRTC connection
  const {
    isConnected,
    isMuted,
    error: webrtcError,
    connect,
    disconnect,
    toggleMute,
  } = useWebRTC({
    roomId,
    userId: user?.id || "",
    enabled: hasJoined,
  });

  // Subscribe to participant changes
  useEffect(() => {
    const channel = supabase
      .channel(`room-participants-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "discussion_room_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          refetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refetchParticipants]);

  // Check if already joined
  useEffect(() => {
    if (currentParticipant && !currentParticipant.left_at) {
      setHasJoined(true);
    }
  }, [currentParticipant]);

  // Connect to WebRTC when joined
  useEffect(() => {
    if (hasJoined && user?.id) {
      connect();
    }
  }, [hasJoined, user?.id, connect]);

  // Show WebRTC errors
  useEffect(() => {
    if (webrtcError) {
      toast.error(`Audio connection error: ${webrtcError}`);
    }
  }, [webrtcError]);

  // Handle join
  const handleJoin = async () => {
    if (!currentParticipant) {
      await joinRoom.mutateAsync(roomId);
    }
    setHasJoined(true);
  };

  // Handle leave
  const handleLeave = async () => {
    await disconnect();
    await leaveRoom.mutateAsync(roomId);
    setHasJoined(false);
    navigate("/audio-rooms");
  };

  // Toggle mute
  const handleToggleMute = () => {
    const newMuted = toggleMute();
    
    if (currentParticipant) {
      updateMute.mutate({
        roomId,
        participantId: currentParticipant.id,
        isMuted: newMuted,
      });
    }
  };

  // Handle mute for other participant (moderator action)
  const handleMuteParticipant = (participantId: string, muted: boolean) => {
    updateMute.mutate({ roomId, participantId, isMuted: muted });
  };

  // Handle promote
  const handlePromote = (participantId: string) => {
    promoteMod.mutate({ roomId, participantId });
  };

  // Handle end room (creator only)
  const handleEndRoom = async () => {
    await endRoom.mutateAsync(roomId);
    navigate("/audio-rooms");
  };

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Room not found</p>
        <Button onClick={() => navigate("/audio-rooms")} className="mt-4">
          Back to Rooms
        </Button>
      </div>
    );
  }

  if (room.status === "ended") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">This discussion has ended</p>
        <Button onClick={() => navigate("/audio-rooms")} className="mt-4">
          Back to Rooms
        </Button>
      </div>
    );
  }

  // Join screen
  if (!hasJoined) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4">
        <h1 className="font-reading text-2xl font-semibold text-card-foreground mb-2">
          {room.title}
        </h1>
        {room.books?.title && (
          <p className="text-muted-foreground mb-4">
            Discussing: {room.books.title}
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-6">
          {participants?.length || 0} participants in this discussion
        </p>
        <Button onClick={handleJoin} size="lg" className="gap-2">
          <Mic className="w-5 h-5" />
          Join Discussion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-reading text-lg font-semibold text-card-foreground truncate">
              {room.title}
            </h1>
            {room.books?.title && (
              <p className="text-sm text-muted-foreground truncate">
                {room.books.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {room.status === "live" ? "Live" : "Scheduled"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4",
          showChat && "hidden sm:block sm:w-1/2"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {participants?.length || 0} Participants
            </span>
          </div>

          <div className="grid gap-3">
            {participants?.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                currentUserId={user?.id}
                isCurrentUserModerator={isModerator}
                roomId={roomId}
                onToggleMute={handleMuteParticipant}
                onPromote={handlePromote}
              />
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-full sm:w-1/2 border-l border-border bg-card">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border sm:hidden">
                <span className="font-medium">Chat</span>
                <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <RoomChat roomId={roomId} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleMute}
            className="rounded-full w-14 h-14"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeave}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {isCreator && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleEndRoom}
              className="rounded-full"
            >
              End Discussion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
