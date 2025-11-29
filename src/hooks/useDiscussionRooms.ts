import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type RoomRole = "creator" | "moderator" | "member";
export type RoomStatus = "scheduled" | "live" | "ended";

export interface DiscussionRoom {
  id: string;
  group_id: string | null;
  book_id: string | null;
  title: string;
  description: string | null;
  created_by: string;
  status: RoomStatus;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  profiles?: { username: string };
  books?: { title: string };
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: RoomRole;
  is_muted: boolean;
  is_speaking: boolean;
  joined_at: string;
  left_at: string | null;
  profiles?: { username: string; avatar_url: string | null };
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string };
}

export interface PointAward {
  id: string;
  room_id: string;
  from_user_id: string;
  to_user_id: string;
  points: number;
  reason: string | null;
  created_at: string;
}

// Fetch all discussion rooms
export function useDiscussionRooms(status?: RoomStatus) {
  return useQuery({
    queryKey: ["discussion_rooms", status],
    queryFn: async () => {
      let query = supabase
        .from("discussion_rooms")
        .select(`
          *,
          profiles:created_by(username),
          books:book_id(title)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DiscussionRoom[];
    },
  });
}

// Fetch single room
export function useDiscussionRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ["discussion_room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const { data, error } = await supabase
        .from("discussion_rooms")
        .select(`
          *,
          profiles:created_by(username),
          books:book_id(title)
        `)
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data as DiscussionRoom;
    },
    enabled: !!roomId,
  });
}

// Fetch room participants
export function useRoomParticipants(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room_participants", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("discussion_room_participants")
        .select(`
          *,
          profiles:user_id(username, avatar_url)
        `)
        .eq("room_id", roomId)
        .is("left_at", null);

      if (error) throw error;
      return data as RoomParticipant[];
    },
    enabled: !!roomId,
  });
}

// Fetch room messages
export function useRoomMessages(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room_messages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("discussion_room_messages")
        .select(`
          *,
          profiles:user_id(username)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as RoomMessage[];
    },
    enabled: !!roomId,
  });
}

// Fetch point awards for a room
export function useRoomPointAwards(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room_point_awards", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("discussion_point_awards")
        .select("*")
        .eq("room_id", roomId);

      if (error) throw error;
      return data as PointAward[];
    },
    enabled: !!roomId,
  });
}

// Create a discussion room
export function useCreateDiscussionRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      groupId,
      bookId,
      scheduledAt,
    }: {
      title: string;
      description?: string;
      groupId?: string;
      bookId?: string;
      scheduledAt?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: room, error: roomError } = await supabase
        .from("discussion_rooms")
        .insert({
          title,
          description,
          group_id: groupId || null,
          book_id: bookId || null,
          created_by: user.id,
          scheduled_at: scheduledAt || null,
          status: scheduledAt ? "scheduled" : "live",
          started_at: scheduledAt ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as participant with creator role
      const { error: participantError } = await supabase
        .from("discussion_room_participants")
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: "creator",
        });

      if (participantError) throw participantError;

      return room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion_rooms"] });
      toast.success("Discussion room created!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create room");
    },
  });
}

// Join a room
export function useJoinRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("discussion_room_participants")
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: "member",
        });

      if (error) throw error;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room_participants", roomId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to join room");
    },
  });
}

// Leave a room
export function useLeaveRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("discussion_room_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room_participants", roomId] });
    },
  });
}

// Update mute status
export function useUpdateMuteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      participantId,
      isMuted,
    }: {
      roomId: string;
      participantId: string;
      isMuted: boolean;
    }) => {
      const { error } = await supabase
        .from("discussion_room_participants")
        .update({ is_muted: isMuted })
        .eq("id", participantId);

      if (error) throw error;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room_participants", roomId] });
    },
  });
}

// Promote to moderator
export function usePromoteToModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      participantId,
    }: {
      roomId: string;
      participantId: string;
    }) => {
      const { error } = await supabase
        .from("discussion_room_participants")
        .update({ role: "moderator" })
        .eq("id", participantId);

      if (error) throw error;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room_participants", roomId] });
      toast.success("User promoted to moderator");
    },
  });
}

// Send message
export function useSendRoomMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      roomId,
      content,
    }: {
      roomId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("discussion_room_messages")
        .insert({
          room_id: roomId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room_messages", roomId] });
    },
  });
}

// Award points
export function useAwardDiscussionPoints() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({
      roomId,
      toUserId,
      points,
      reason,
    }: {
      roomId: string;
      toUserId: string;
      points: 5 | 10 | 15 | 20 | 50;
      reason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (user.id === toUserId) throw new Error("Cannot award points to yourself");

      // Insert the award
      const { error: awardError } = await supabase
        .from("discussion_point_awards")
        .insert({
          room_id: roomId,
          from_user_id: user.id,
          to_user_id: toUserId,
          points,
          reason,
        });

      if (awardError) throw awardError;

      // Update recipient's total points
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", toUserId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: (profile.points || 0) + points })
        .eq("id", toUserId);

      if (updateError) throw updateError;

      return { points, toUserId };
    },
    onSuccess: (data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room_point_awards", roomId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
      toast.success(`Awarded ${data.points} points!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to award points");
    },
  });
}

// End room
export function useEndRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from("discussion_rooms")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      if (error) throw error;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["discussion_room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["discussion_rooms"] });
      toast.success("Discussion ended");
    },
  });
}
