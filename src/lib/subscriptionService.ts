/**
 * Subscription Verification Service
 * Server-side subscription verification with multi-layer security
 * Based on Defense in Depth principles
 */

import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  isValid: boolean;
  tier: 'free' | 'premium';
  expiresAt?: Date;
  reason?: string;
  source?: string;
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  triggerSubscriptionModal?: boolean;
  requiredTier?: 'free' | 'premium';
  tier?: 'free' | 'premium';
  expiresAt?: Date;
}

/**
 * Multi-layer subscription verification
 * Layer 1: Database check
 * Layer 2: Expiration check
 * Layer 3: Status validation
 */
export async function verifySubscription(
  userId: string,
  requiredTier: 'free' | 'premium' = 'free'
): Promise<SubscriptionStatus> {
  try {
    // Layer 1: Check database for active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Subscription verification error:', error);
      // Fail closed - deny access on error
      return {
        isValid: false,
        tier: 'free',
        reason: 'verification_error',
        source: 'database_error'
      };
    }

    // Layer 2: Check if subscription exists and is not expired
    if (!subscription) {
      return {
        isValid: requiredTier === 'free',
        tier: 'free',
        reason: requiredTier === 'premium' ? 'no_subscription' : undefined,
        source: 'database'
      };
    }

    // Layer 3: Check expiration
    const expiresAt = new Date(subscription.current_period_end);
    const now = new Date();
    
    if (expiresAt < now) {
      return {
        isValid: false,
        tier: 'free',
        reason: 'subscription_expired',
        expiresAt,
        source: 'database'
      };
    }

    // Layer 4: Check tier requirement
    if (requiredTier === 'premium' && subscription.tier !== 'premium') {
      return {
        isValid: false,
        tier: subscription.tier as 'free' | 'premium',
        reason: 'insufficient_tier',
        expiresAt,
        source: 'database'
      };
    }

    return {
      isValid: true,
      tier: subscription.tier as 'free' | 'premium',
      expiresAt,
      source: 'verified'
    };
  } catch (error) {
    console.error('Subscription verification exception:', error);
    // Fail closed
    return {
      isValid: false,
      tier: 'free',
      reason: 'exception',
      source: 'error'
    };
  }
}

/**
 * Log access attempt for audit trail
 */
export async function logAccessAttempt(
  userId: string,
  feature: string,
  action: 'allowed' | 'denied',
  reason?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Get client info
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    // IP would need to be passed from server-side
    const ipAddress = null;

    await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        feature,
        action,
        reason,
        user_agent: userAgent,
        ip_address: ipAddress,
        metadata: metadata || {}
      });
  } catch (error) {
    console.error('Failed to log access attempt:', error);
    // Don't throw - logging failure shouldn't block access
  }
}

/**
 * Access control middleware
 */
export async function requireSubscription(
  userId: string,
  requiredTier: 'free' | 'premium',
  feature: string
): Promise<AccessResult> {
  // Verify subscription
  const subscription = await verifySubscription(userId, requiredTier);

  if (!subscription.isValid) {
    // Log denied access
    await logAccessAttempt(userId, feature, 'denied', subscription.reason);

    return {
      allowed: false,
      reason: subscription.reason,
      triggerSubscriptionModal: requiredTier === 'premium',
      requiredTier
    };
  }

  // Log allowed access
  await logAccessAttempt(userId, feature, 'allowed');

  return {
    allowed: true,
    tier: subscription.tier,
    expiresAt: subscription.expiresAt
  };
}

/**
 * Check library access
 */
export async function guardLibraryAccess(userId: string): Promise<AccessResult> {
  return requireSubscription(userId, 'premium', 'library');
}

/**
 * Check expert session access
 */
export async function guardExpertSession(userId: string): Promise<AccessResult> {
  return requireSubscription(userId, 'premium', 'expert_session');
}

/**
 * Check vocabulary access
 */
export async function guardVocabularyAccess(userId: string): Promise<AccessResult> {
  return requireSubscription(userId, 'premium', 'vocabulary');
}

