import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportByAuthorParams {
  author: string;
  limit?: number;
}

interface ImportByCategoryParams {
  category: "classic_fiction" | "drama_poetry" | "philosophy_essays" | "adventure_mystery";
}

interface FetchContentParams {
  gutenberg_id: number;
  book_id: string;
}

export function useImportBooksByAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ author, limit = 10 }: ImportByAuthorParams) => {
      const { data, error } = await supabase.functions.invoke('import-books', {
        body: { action: 'import_by_author', author, limit }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Imported ${data.imported} books`);
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast.error('Failed to import books');
    }
  });
}

export function useImportBooksByCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category }: ImportByCategoryParams) => {
      const { data, error } = await supabase.functions.invoke('import-books', {
        body: { action: 'import_by_category', category }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Imported ${data.imported} books from ${data.category}`);
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast.error('Failed to import books');
    }
  });
}

export function useFetchBookContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gutenberg_id, book_id }: FetchContentParams) => {
      const { data, error } = await supabase.functions.invoke('import-books', {
        body: { action: 'fetch_book_content', gutenberg_id, book_id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success(`Created ${data.chapters_created} chapters`);
    },
    onError: (error) => {
      console.error('Fetch content error:', error);
      toast.error('Failed to fetch book content');
    }
  });
}
