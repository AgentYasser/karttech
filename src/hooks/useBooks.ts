import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Book {
  id: string;
  title: string;
  author: string;
  category: "classic" | "contemporary" | "subscriber";
  content_type: "novel" | "play" | "poem";
  description: string | null;
  cover_image_url: string | null;
  gutenberg_id: number | null;
  word_count: number;
  estimated_reading_time: number;
  is_featured: boolean;
  requires_points: boolean;
  points_cost: number;
  early_access_until: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  word_count: number;
}

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("title");
      
      if (error) throw error;
      return data as Book[];
    },
  });
}

export function useFeaturedBooks() {
  return useQuery({
    queryKey: ["books", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_featured", true)
        .limit(6);
      
      if (error) throw error;
      return data as Book[];
    },
  });
}

export function useBook(bookId: string | undefined) {
  return useQuery({
    queryKey: ["books", bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Book | null;
    },
    enabled: !!bookId,
  });
}

export function useBookChapters(bookId: string | undefined) {
  return useQuery({
    queryKey: ["chapters", bookId],
    queryFn: async () => {
      if (!bookId) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("chapter_number");
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!bookId,
  });
}
