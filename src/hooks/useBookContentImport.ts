/**
 * Hook for importing book content
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { importBookContent, importAllMissingContent, getBooksWithoutContent } from "@/utils/bookContentManager";
import { toast } from "sonner";

export function useImportBookContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, gutenbergId }: { bookId: string; gutenbergId: number }) => {
      return await importBookContent(bookId, gutenbergId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (data.chaptersCreated > 0) {
        toast.success(`Imported ${data.chaptersCreated} chapters`);
      }
    },
    onError: (error: any) => {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import book content");
    },
  });
}

export function useImportAllMissingContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (onProgress?: (current: number, total: number, bookTitle: string) => void) => {
      return await importAllMissingContent(onProgress);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`Imported content for ${data.imported} books. ${data.failed} failed.`);
    },
    onError: (error: any) => {
      console.error("Batch import error:", error);
      toast.error("Failed to import book content");
    },
  });
}

export function useBooksWithoutContent() {
  return useQuery({
    queryKey: ["books", "without-content"],
    queryFn: async () => {
      return await getBooksWithoutContent();
    },
  });
}

