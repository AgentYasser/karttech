import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Discussion {
  id: string;
  book_id: string;
  chapter_id: string | null;
  user_id: string;
  title: string;
  content: string;
  discussion_type: "solo" | "group" | "communal";
  upvotes: number;
  is_featured: boolean;
  created_at: string;
  profiles?: {
    username: string;
  };
  books?: {
    title: string;
  };
}

export interface DiscussionMessage {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "audio";
  audio_url: string | null;
  upvotes: number;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export function useDiscussions(bookId?: string) {
  return useQuery({
    queryKey: ["discussions", bookId],
    queryFn: async () => {
      let query = supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id (username),
          books:book_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (bookId) {
        query = query.eq("book_id", bookId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Discussion[];
    },
  });
}

export function useDiscussion(discussionId: string | undefined) {
  return useQuery({
    queryKey: ["discussions", discussionId],
    queryFn: async () => {
      if (!discussionId) return null;
      
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id (username),
          books:book_id (title)
        `)
        .eq("id", discussionId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Discussion | null;
    },
    enabled: !!discussionId,
  });
}

export function useDiscussionMessages(discussionId: string | undefined) {
  return useQuery({
    queryKey: ["discussion_messages", discussionId],
    queryFn: async () => {
      if (!discussionId) return [];
      
      const { data, error } = await supabase
        .from("discussion_messages")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as DiscussionMessage[];
    },
    enabled: !!discussionId,
  });
}

export function useCreateDiscussion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      bookId,
      title,
      content,
      discussionType,
    }: {
      bookId: string;
      title: string;
      content: string;
      discussionType: "solo" | "group" | "communal";
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("discussions")
        .insert({
          book_id: bookId,
          user_id: user.id,
          title,
          content,
          discussion_type: discussionType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

export function usePostMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      discussionId,
      content,
      messageType = "text",
    }: {
      discussionId: string;
      content: string;
      messageType?: "text" | "audio";
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("discussion_messages")
        .insert({
          discussion_id: discussionId,
          user_id: user.id,
          content,
          message_type: messageType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["discussion_messages", variables.discussionId] });
    },
  });
}
