import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReadingGroup {
  id: string;
  name: string;
  description: string | null;
  book_id: string | null;
  created_by: string;
  max_members: number;
  is_private: boolean;
  current_chapter: number;
  created_at: string;
  books?: {
    id: string;
    title: string;
    author: string;
  };
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
  profiles?: {
    username: string;
  };
}

export function useGroups() {
  return useQuery({
    queryKey: ["reading_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_groups")
        .select(`
          *,
          books:book_id (id, title, author)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member counts
      const groupsWithCounts = await Promise.all(
        (data || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          return { ...group, member_count: count || 0 };
        })
      );

      return groupsWithCounts as ReadingGroup[];
    },
  });
}

export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: ["group_members", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq("group_id", groupId);

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      bookId,
      isPrivate,
      maxMembers,
    }: {
      name: string;
      description?: string;
      bookId?: string;
      isPrivate?: boolean;
      maxMembers?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Create group
      const { data: group, error: groupError } = await supabase
        .from("reading_groups")
        .insert({
          name,
          description,
          book_id: bookId,
          created_by: user.id,
          is_private: isPrivate || false,
          max_members: maxMembers || 15,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading_groups"] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .rpc('join_group', { group_id_param: groupId });

      if (error) throw error;

      // Check success from RPC response
      if (data && !(data as any).success) {
        throw new Error((data as any).message || "Failed to join group");
      }

      return data;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["reading_groups"] });
      queryClient.invalidateQueries({ queryKey: ["group_members", groupId] });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["reading_groups"] });
      queryClient.invalidateQueries({ queryKey: ["group_members", groupId] });
    },
  });
}
