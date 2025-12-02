/**
 * Secure Vocabulary Hooks
 * Replaces useVocabulary with subscription and limit enforcement
 * NO DELETIONS - Immutable storage only
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  addWord,
  getVocabulary,
  getVocabularyLimit,
  getVocabularyCount,
  purchaseStorage,
  type AddWordResult,
  type VocabListResult
} from "@/lib/vocabularyStorageService";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { useState } from "react";

/**
 * Hook to get user vocabulary with limits
 */
export function useUserVocabularySecure() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vocabulary-secure", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      return getVocabulary(user.id);
    },
    enabled: !!user,
  });
}

/**
 * Hook to get vocabulary limit info
 */
export function useVocabularyLimit() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vocabulary-limit", user?.id],
    queryFn: async () => {
      if (!user) return { limit: 20, count: 0, remaining: 20 };
      
      const [limit, count] = await Promise.all([
        getVocabularyLimit(user.id),
        getVocabularyCount(user.id)
      ]);

      return {
        limit,
        count,
        remaining: Math.max(0, limit - count),
        canAddMore: count < limit
      };
    },
    enabled: !!user,
  });
}

/**
 * Hook to add word to vocabulary (with limits and subscription checks)
 */
export function useAddVocabularySecure() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  const mutation = useMutation<AddWordResult, Error, {
    word: string;
    definition?: string;
    bookId?: string;
    context?: string;
  }>({
    mutationFn: async ({
      word,
      definition,
      bookId,
      context
    }) => {
      if (!user) throw new Error("Not authenticated");
      return addWord(user.id, word, context, bookId, definition);
    },
    onSuccess: (result: AddWordResult) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["vocabulary-secure"] });
        queryClient.invalidateQueries({ queryKey: ["vocabulary-limit"] });
        toast.success(`Word added! ${result.remainingSlots} slots remaining.`);
      } else {
        if (result.reason === 'subscription_required') {
          setShowSubscriptionModal(true);
          toast.error(result.message || "Subscription required for vocabulary access");
        } else if (result.reason === 'limit_reached') {
          setShowStorageModal(true);
          toast.error(`Limit reached! Purchase ${result.nextIncrementWords} more words for $${result.nextIncrementPrice}`);
        } else if (result.reason === 'duplicate_word') {
          toast.info("Word already in your vocabulary");
        } else {
          toast.error(result.message || "Failed to add word");
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add word");
    },
  });

  return {
    ...mutation,
    showSubscriptionModal,
    setShowSubscriptionModal,
    showStorageModal,
    setShowStorageModal
  };
}

/**
 * Hook to purchase vocabulary storage
 */
export function usePurchaseVocabularyStorage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (increments: number = 1) => {
      if (!user) throw new Error("Not authenticated");
      return purchaseStorage(user.id, increments);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Purchase initiated: ${result.wordsAdded} words for $${result.price}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to initiate purchase");
    },
  });
}

// NOTE: useDeleteVocabulary is intentionally NOT exported
// Vocabulary is immutable - no deletions allowed

