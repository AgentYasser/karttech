import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useUserPurchases() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user_purchases", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_book_purchases")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useHasBookAccess(bookId: string | undefined) {
  const { user, profile } = useAuth();
  
  return useQuery({
    queryKey: ["book_access", bookId, user?.id],
    queryFn: async () => {
      if (!bookId || !user?.id) return { hasAccess: false, requiresPoints: false, pointsCost: 0 };
      
      // Get book details
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("requires_points, points_cost, early_access_until")
        .eq("id", bookId)
        .single();
      
      if (bookError) throw bookError;
      
      // If book doesn't require points, access is granted
      if (!book.requires_points) {
        return { hasAccess: true, requiresPoints: false, pointsCost: 0 };
      }
      
      // Check if user has purchased this book
      const { data: purchase } = await supabase
        .from("user_book_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();
      
      if (purchase) {
        return { hasAccess: true, requiresPoints: true, pointsCost: book.points_cost || 0 };
      }
      
      // Check early access period
      if (book.early_access_until) {
        const earlyAccessEnd = new Date(book.early_access_until);
        if (new Date() > earlyAccessEnd) {
          // Early access period ended, free for everyone
          return { hasAccess: true, requiresPoints: false, pointsCost: 0 };
        }
      }
      
      return { 
        hasAccess: false, 
        requiresPoints: true, 
        pointsCost: book.points_cost || 0,
        earlyAccessUntil: book.early_access_until 
      };
    },
    enabled: !!bookId && !!user?.id,
  });
}

export function usePurchaseBook() {
  const queryClient = useQueryClient();
  const { user, profile, refreshProfile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ bookId, pointsCost }: { bookId: string; pointsCost: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!profile) throw new Error("Profile not loaded");
      
      const currentPoints = profile.points || 0;
      if (currentPoints < pointsCost) {
        throw new Error("Not enough points");
      }
      
      // Deduct points from profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ points: currentPoints - pointsCost })
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      // Record the purchase
      const { error: purchaseError } = await supabase
        .from("user_book_purchases")
        .insert({
          user_id: user.id,
          book_id: bookId,
          points_spent: pointsCost,
        });
      
      if (purchaseError) throw purchaseError;
      
      // Record transaction
      await supabase
        .from("points_transactions")
        .insert({
          user_id: user.id,
          points: -pointsCost,
          transaction_type: "spend",
          source: "book_purchase",
          description: `Purchased book access`,
        });
      
      return { success: true };
    },
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: ["book_access", bookId] });
      queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
      toast.success("Book unlocked! Enjoy reading.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to purchase book");
    },
  });
}
