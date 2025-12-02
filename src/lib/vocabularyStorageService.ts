/**
 * Vocabulary Storage Service
 * Immutable vocabulary storage with strict limits
 * Pricing: 20 words free, then $2 per 10 words
 */

import { supabase } from "@/integrations/supabase/client";
import { verifySubscription, logAccessAttempt } from "./subscriptionService";

const FREE_WORDS = 20;
const PAID_INCREMENT = 10; // Words per purchase increment
const PAID_INCREMENT_PRICE = 2.00; // $2.00 per 10 words

export interface AddWordResult {
  success: boolean;
  reason?: string;
  wordCount?: number;
  currentLimit?: number;
  remainingSlots?: number;
  triggerPaymentModal?: boolean;
  nextIncrementPrice?: number;
  nextIncrementWords?: number;
  message?: string;
}

export interface VocabListResult {
  words: any[];
  count: number;
  limit: number;
  remaining: number;
  canAddMore: boolean;
}

/**
 * Get vocabulary limit for user
 */
export async function getVocabularyLimit(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_vocabulary_limit', { user_uuid: userId });

    if (error) {
      console.error('Error getting vocabulary limit:', error);
      // Fallback to direct calculation
      const { data: purchases } = await supabase
        .from('storage_purchases')
        .select('words_added')
        .eq('user_id', userId)
        .eq('verified', true);

      const purchasedWords = purchases?.reduce((sum, p) => sum + p.words_added, 0) || 0;
      return FREE_WORDS + purchasedWords;
    }

    return data || FREE_WORDS;
  } catch (error) {
    console.error('Get vocabulary limit error:', error);
    return FREE_WORDS;
  }
}

/**
 * Get current vocabulary count
 */
export async function getVocabularyCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_vocabulary_count', { user_uuid: userId });

    if (error) {
      console.error('Error getting vocabulary count:', error);
      // Fallback to direct query
      const { data: vocab } = await supabase
        .from('user_vocabulary')
        .select('id')
        .eq('user_id', userId);

      return vocab?.length || 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Get vocabulary count error:', error);
    return 0;
  }
}

/**
 * Add word to vocabulary - Immutable (no deletions)
 * Pricing: 20 free, then $2 per 10 words
 */
export async function addWord(
  userId: string,
  word: string,
  context?: string,
  bookId?: string,
  definition?: string
): Promise<AddWordResult> {
  try {
    // Step 1: Verify subscription for vocabulary access
    const subscription = await verifySubscription(userId, 'premium');
    if (!subscription.isValid) {
      await logAccessAttempt(userId, 'vocabulary', 'denied', 'subscription_required');
      return {
        success: false,
        reason: 'subscription_required',
        message: 'Vocabulary access requires $9.99/month subscription'
      };
    }

    // Step 2: Get current vocabulary count (from database)
    const wordCount = await getVocabularyCount(userId);

    // Step 3: Check if word already exists (prevent duplicates)
    const { data: existing } = await supabase
      .from('user_vocabulary')
      .select('id')
      .eq('user_id', userId)
      .eq('word', word.toLowerCase())
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        reason: 'duplicate_word',
        wordCount
      };
    }

    // Step 4: Calculate current tier and limits
    const currentLimit = await getVocabularyLimit(userId);

    // Step 5: Check if limit reached
    if (wordCount >= currentLimit) {
      await logAccessAttempt(userId, 'vocabulary', 'denied', 'limit_reached', {
        wordCount,
        currentLimit
      });

      return {
        success: false,
        reason: 'limit_reached',
        wordCount,
        currentLimit,
        nextIncrementPrice: PAID_INCREMENT_PRICE,
        nextIncrementWords: PAID_INCREMENT,
        triggerPaymentModal: true
      };
    }

    // Step 6: Add word (immutable append)
    const { data, error } = await supabase
      .from('user_vocabulary')
      .insert({
        user_id: userId,
        word: word.toLowerCase(), // Normalize
        definition: definition || null,
        book_id: bookId || null,
        mastery_level: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding word:', error);
      return {
        success: false,
        reason: 'insert_error',
        message: error.message
      };
    }

    // Step 7: Log successful addition
    await logAccessAttempt(userId, 'vocabulary', 'allowed', undefined, {
      word: word,
      wordCount: wordCount + 1
    });

    return {
      success: true,
      wordCount: wordCount + 1,
      currentLimit,
      remainingSlots: currentLimit - (wordCount + 1)
    };
  } catch (error) {
    console.error('Add word error:', error);
    return {
      success: false,
      reason: 'exception',
      message: 'An error occurred while adding the word'
    };
  }
}

/**
 * Get vocabulary list - Requires subscription
 */
export async function getVocabulary(userId: string): Promise<VocabListResult> {
  try {
    // Verify subscription first
    const subscription = await verifySubscription(userId, 'premium');
    if (!subscription.isValid) {
      throw new Error('Subscription required');
    }

    const { data: vocab, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .order('learned_at', { ascending: false });

    if (error) {
      throw error;
    }

    const count = vocab?.length || 0;
    const limit = await getVocabularyLimit(userId);
    const remaining = Math.max(0, limit - count);

    return {
      words: vocab || [],
      count,
      limit,
      remaining,
      canAddMore: count < limit
    };
  } catch (error) {
    console.error('Get vocabulary error:', error);
    throw error;
  }
}

/**
 * Purchase additional vocabulary storage
 */
export async function purchaseStorage(
  userId: string,
  increments: number = 1
): Promise<{ paymentIntentId?: string; clientSecret?: string; price: number; wordsAdded: number; error?: string }> {
  try {
    const price = increments * PAID_INCREMENT_PRICE;

    // Note: In production, this should call a server-side API endpoint
    // that creates a Stripe PaymentIntent
    // For now, return the purchase details
    return {
      price,
      wordsAdded: increments * PAID_INCREMENT,
      error: 'Stripe integration required. This should call a server-side API.'
    };
  } catch (error) {
    console.error('Purchase storage error:', error);
    return {
      price: 0,
      wordsAdded: 0,
      error: 'Failed to initiate purchase'
    };
  }
}

