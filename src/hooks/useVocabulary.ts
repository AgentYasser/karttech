import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VocabularyWord {
  id: string;
  user_id: string;
  word: string;
  definition: string | null;
  book_id: string | null;
  mastery_level: number;
  learned_at: string;
}

export function useUserVocabulary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vocabulary", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_vocabulary")
        .select("*")
        .eq("user_id", user.id)
        .order("learned_at", { ascending: false });

      if (error) throw error;
      return data as VocabularyWord[];
    },
    enabled: !!user,
  });
}

export function useAddVocabulary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      word, 
      definition, 
      bookId 
    }: { 
      word: string; 
      definition: string; 
      bookId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if word already exists
      const { data: existing } = await supabase
        .from("user_vocabulary")
        .select("id")
        .eq("user_id", user.id)
        .eq("word", word.toLowerCase())
        .maybeSingle();

      if (existing) {
        throw new Error("Word already in your vocabulary");
      }

      const { data, error } = await supabase
        .from("user_vocabulary")
        .insert({
          user_id: user.id,
          word: word.toLowerCase(),
          definition,
          book_id: bookId || null,
          mastery_level: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      toast.success("Word added to your vocabulary!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add word");
    },
  });
}

export function useUpdateMastery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      masteryLevel 
    }: { 
      id: string; 
      masteryLevel: number;
    }) => {
      const { error } = await supabase
        .from("user_vocabulary")
        .update({ mastery_level: masteryLevel })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });
}

export function useDeleteVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_vocabulary")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      toast.success("Word removed from vocabulary");
    },
    onError: () => {
      toast.error("Failed to remove word");
    },
  });
}

// Dictionary API lookup
export async function lookupWord(word: string): Promise<{
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
} | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data[0] || null;
  } catch {
    return null;
  }
}
