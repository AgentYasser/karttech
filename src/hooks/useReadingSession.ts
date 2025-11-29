import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  current_chapter: number;
  current_position: number;
  reading_time_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
  last_read_at: string;
}

export function useReadingSession(bookId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["reading_session", bookId, user?.id],
    queryFn: async () => {
      if (!bookId || !user) return null;
      
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReadingSession | null;
    },
    enabled: !!bookId && !!user,
  });
}

export function useCurrentReading() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["reading_sessions", "current", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("reading_sessions")
        .select(`
          *,
          books:book_id (*)
        `)
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("last_read_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpsertReadingSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      bookId,
      currentChapter,
      currentPosition,
      readingTimeSeconds,
      isCompleted,
    }: {
      bookId: string;
      currentChapter?: number;
      currentPosition?: number;
      readingTimeSeconds?: number;
      isCompleted?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data: existing } = await supabase
        .from("reading_sessions")
        .select("id, reading_time_seconds")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      const updateData: any = {
        user_id: user.id,
        book_id: bookId,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      if (currentChapter !== undefined) updateData.current_chapter = currentChapter;
      if (currentPosition !== undefined) updateData.current_position = currentPosition;
      if (readingTimeSeconds !== undefined) {
        updateData.reading_time_seconds = (existing?.reading_time_seconds || 0) + readingTimeSeconds;
      }
      if (isCompleted !== undefined) {
        updateData.is_completed = isCompleted;
        if (isCompleted) updateData.completed_at = new Date().toISOString();
      }
      
      if (existing) {
        const { data, error } = await supabase
          .from("reading_sessions")
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("reading_sessions")
          .insert(updateData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reading_session", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["reading_sessions"] });
    },
  });
}
