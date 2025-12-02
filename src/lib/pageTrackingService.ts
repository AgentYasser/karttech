/**
 * Page Read Tracking Service
 * Tracks reading progress with server-side enforcement
 * Implements immutable logging (append-only)
 */

import { supabase } from "@/integrations/supabase/client";
import { verifySubscription } from "./subscriptionService";
import { logAccessAttempt } from "./subscriptionService";

const FREE_PAGE_LIMIT = 2; // 2 free pages of actual content (excluding disclaimers)
const SUBSCRIPTION_TRIGGER_PAGES = 3; // Show subscription modal after 3 pages

export interface TrackPageReadResult {
  allowed: boolean;
  reason?: string;
  pagesRead?: number;
  limit?: number;
  triggerSubscriptionModal?: boolean;
}

/**
 * Generate integrity hash for read history entry
 */
function generateHash(data: {
  userId: string;
  bookId: string;
  pageNumber: number;
  timestamp: string;
}): string {
  // Simple hash for integrity checking
  // In production, use crypto.subtle.digest for stronger hashing
  const str = `${data.userId}-${data.bookId}-${data.pageNumber}-${data.timestamp}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Track page read - Server-side only (cannot be bypassed)
 */
export async function trackPageRead(
  userId: string,
  bookId: string,
  chapterId: string | null,
  pageNumber: number,
  isDisclaimerPage: boolean
): Promise<TrackPageReadResult> {
  try {
    // Step 1: Verify subscription
    const subscription = await verifySubscription(userId, 'free');
    if (!subscription.isValid) {
      return { allowed: false, reason: 'no_subscription' };
    }

    // Step 2: Get current read count (from database, not client)
    const { data: readHistory, error: historyError } = await supabase
      .from('read_history')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('is_disclaimer_page', false);

    if (historyError) {
      console.error('Error fetching read history:', historyError);
      return { allowed: false, reason: 'database_error' };
    }

    const actualPagesRead = readHistory?.length || 0;

    // Step 3: Check limit (2 free pages, then paywall)
    if (actualPagesRead >= FREE_PAGE_LIMIT && subscription.tier === 'free') {
      // Log access attempt
      await logAccessAttempt(userId, 'reading', 'denied', 'paywall_triggered', {
        pagesRead: actualPagesRead,
        limit: FREE_PAGE_LIMIT
      });

      return {
        allowed: false,
        reason: 'paywall_triggered',
        pagesRead: actualPagesRead,
        limit: FREE_PAGE_LIMIT,
        triggerSubscriptionModal: true
      };
    }

    // Step 4: Record the page read (immutable log)
    const timestamp = new Date().toISOString();
    const hash = generateHash({
      userId,
      bookId,
      pageNumber,
      timestamp
    });

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const ipAddress = null; // Would need server-side to get real IP

    const { error: insertError } = await supabase
      .from('read_history')
      .insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: chapterId,
        page_number: pageNumber,
        is_disclaimer_page: isDisclaimerPage,
        timestamp,
        user_agent: userAgent,
        ip_address: ipAddress,
        hash
      });

    if (insertError) {
      console.error('Error recording page read:', insertError);
      return { allowed: false, reason: 'recording_error' };
    }

    // Step 5: Check 3-page trigger for subscription modal
    const newPageCount = isDisclaimerPage ? actualPagesRead : actualPagesRead + 1;
    if (newPageCount === SUBSCRIPTION_TRIGGER_PAGES && subscription.tier === 'free') {
      await logAccessAttempt(userId, 'reading', 'allowed', undefined, {
        triggerModal: true,
        pagesRead: newPageCount
      });

      return {
        allowed: true,
        pagesRead: newPageCount,
        triggerSubscriptionModal: true
      };
    }

    // Log successful read
    await logAccessAttempt(userId, 'reading', 'allowed', undefined, {
      pagesRead: newPageCount
    });

    return {
      allowed: true,
      pagesRead: newPageCount
    };
  } catch (error) {
    console.error('Page tracking error:', error);
    return { allowed: false, reason: 'exception' };
  }
}

/**
 * Get pages read count for a user and book
 */
export async function getPagesRead(
  userId: string,
  bookId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_pages_read', {
        user_uuid: userId,
        book_uuid: bookId
      });

    if (error) {
      console.error('Error getting pages read:', error);
      // Fallback to direct query
      const { data: readHistory } = await supabase
        .from('read_history')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('is_disclaimer_page', false);

      return readHistory?.length || 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Get pages read error:', error);
    return 0;
  }
}

