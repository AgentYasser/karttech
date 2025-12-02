# Subscription & Monetization System Implementation

## Overview

This document describes the secure subscription and monetization system implemented for karttech, based on timeless security principles and defense-in-depth architecture.

## 🎯 Key Features Implemented

### 1. **Secure Subscription System**
- Multi-layer verification (database + expiration + tier checks)
- Server-side enforcement (cannot be bypassed client-side)
- Immutable subscription logs
- Automatic tier synchronization

### 2. **Page Reading Tracking**
- Tracks pages read per user/book
- 2 free pages (excluding disclaimers)
- Subscription modal trigger after 3 pages
- Immutable append-only logs
- Server-side page counting (cannot be manipulated)

### 3. **Vocabulary Storage System**
- **20 words free** (requires premium subscription)
- **$2.00 per 10 additional words**
- **NO DELETIONS** - Immutable storage
- Automatic limit enforcement
- Purchase flow for additional storage

### 4. **Monetization Triggers**
- After 3 pages read → Subscription modal
- Library access → Subscription required
- Expert sessions → Subscription required
- Vocabulary access → Subscription required
- Vocabulary limit reached → Storage purchase modal

### 5. **Pricing Structure**
- **Monthly**: $9.99/month
- **Annual**: $99.99/year (Save 17% = $8.33/month)
- **Micro-transactions**:
  - Vocabulary storage: $2.00 per 10 words
  - Expert session minutes: $2.00 per block (TODO: implement)
  - Feature access: $2.00 one-time (TODO: implement)

## 🔐 Security Architecture

### Defense in Depth
Multiple independent security layers:
1. **Client-side validation** (UX only, can be bypassed)
2. **Server-side verification** (authoritative)
3. **Database constraints** (immutable)
4. **RLS policies** (row-level security)
5. **Audit logging** (all access attempts)

### Immutability
- **Vocabulary**: Append-only, no deletions
- **Read History**: Append-only logs
- **Subscriptions**: Soft-delete only
- **Storage Purchases**: Immutable audit trail

### Fail-Closed Principle
- All verification failures default to denying access
- Errors in verification = no access granted
- Mismatched data = access denied

## 📁 File Structure

### Database Migrations
```
supabase/migrations/20250103000000_subscription_system.sql
```
- Creates `subscriptions` table
- Creates `read_history` table (append-only)
- Creates `storage_purchases` table (immutable)
- Creates `access_logs` table (audit trail)
- Creates helper functions (get_vocabulary_limit, has_active_subscription, etc.)
- Sets up RLS policies

### Core Services
```
src/lib/subscriptionService.ts
```
- `verifySubscription()` - Multi-layer verification
- `requireSubscription()` - Access control middleware
- `guardLibraryAccess()`, `guardVocabularyAccess()`, `guardExpertSession()`
- `logAccessAttempt()` - Audit logging

```
src/lib/pageTrackingService.ts
```
- `trackPageRead()` - Server-side page tracking
- `getPagesRead()` - Get page count (excluding disclaimers)
- Enforces 2-page free limit

```
src/lib/vocabularyStorageService.ts
```
- `addWord()` - Add word with limit enforcement
- `getVocabulary()` - Get vocab with limits
- `getVocabularyLimit()` - Calculate limit (20 free + purchased)
- `purchaseStorage()` - Initiate storage purchase

### React Hooks
```
src/hooks/useVocabularySecure.ts
```
- `useUserVocabularySecure()` - Get vocab with limits
- `useVocabularyLimit()` - Get limit info
- `useAddVocabularySecure()` - Add word (with modals)
- `usePurchaseVocabularyStorage()` - Purchase storage

### UI Components
```
src/components/subscription/SubscriptionModal.tsx
```
- Updated pricing: $9.99/month, $99.99/year
- Features list includes vocabulary access

```
src/pages/Vocabulary.tsx
```
- Removed deletion functionality
- Shows limit progress (X / Y words)
- Subscription gate
- Storage purchase modal

```
src/components/reading/WordLookupDialog.tsx
```
- Updated to use secure vocabulary hooks
- Shows subscription/storage modals when needed

## 🗄️ Database Schema

### subscriptions
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- tier ('free' | 'premium')
- stripe_subscription_id (TEXT, UNIQUE)
- status ('active' | 'cancelled' | 'expired' | 'past_due')
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- created_at, updated_at, deleted_at (soft delete)
```

### read_history (Immutable)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- book_id (TEXT)
- chapter_id (UUID)
- page_number (INTEGER)
- is_disclaimer_page (BOOLEAN)
- timestamp (TIMESTAMP)
- hash (TEXT) -- Integrity check
- NO UPDATE, NO DELETE -- Append only
```

### storage_purchases (Immutable)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- increments (INTEGER) -- Number of 10-word blocks
- words_added (INTEGER) -- increments * 10
- price (DECIMAL)
- stripe_payment_intent_id (TEXT, UNIQUE)
- verified (BOOLEAN) -- Only true from webhook
- purchased_at (TIMESTAMP)
- NO UPDATE, NO DELETE -- Audit trail
```

### access_logs (Audit Trail)
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- feature (TEXT) -- 'library', 'vocabulary', etc.
- action ('allowed' | 'denied')
- reason (TEXT)
- ip_address, user_agent, metadata (JSONB)
- created_at (TIMESTAMP)
```

## 🚀 Usage Examples

### Check Subscription
```typescript
import { verifySubscription } from '@/lib/subscriptionService';

const status = await verifySubscription(userId, 'premium');
if (!status.isValid) {
  // Show subscription modal
}
```

### Track Page Read
```typescript
import { trackPageRead } from '@/lib/pageTrackingService';

const result = await trackPageRead(
  userId,
  bookId,
  chapterId,
  pageNumber,
  isDisclaimerPage
);

if (result.triggerSubscriptionModal) {
  // Show subscription modal
}
```

### Add Word to Vocabulary
```typescript
import { useAddVocabularySecure } from '@/hooks/useVocabularySecure';

const { mutate: addWord, showSubscriptionModal, showStorageModal } = useAddVocabularySecure();

addWord({
  word: "example",
  definition: "A thing characteristic of its kind",
  bookId: "book-123"
}, {
  onSuccess: (result) => {
    if (!result.success && result.reason === 'subscription_required') {
      setShowSubscriptionModal(true);
    }
  }
});
```

## 🔧 Next Steps

### TODO
1. **Stripe Integration**
   - Create PaymentIntent API endpoints
   - Set up webhook handlers for subscription/purchase events
   - Update `purchaseStorage()` to call API

2. **Page Tracking Integration**
   - Integrate `trackPageRead()` into ReadingPage
   - Update page calculation to exclude disclaimers
   - Add subscription modal trigger after 3 pages

3. **Expert Sessions**
   - Implement booking with subscription check
   - Add minute tracking
   - Purchase additional minutes flow

4. **Library Access**
   - Add subscription gate to Library page
   - Check subscription on mount

5. **Database Migration**
   - Run migration on Supabase
   - Test RLS policies
   - Verify helper functions

## ⚠️ Important Notes

### No Client-Side Bypass
- All critical checks are server-side
- Client can modify UI state, but server validates everything
- Never trust client-side subscription status

### Immutable Vocabulary
- Words cannot be deleted once added
- This is by design (immutability principle)
- Users can add words, but cannot remove them

### Subscription Sync
- Profile `subscription_tier` syncs automatically via trigger
- Always check database, not profile, for authoritative status
- Profile is for UI convenience only

### Rate Limiting
- Consider adding rate limiting for API calls
- Prevent abuse of subscription checks
- Monitor access_logs for suspicious patterns

## 🧪 Testing Checklist

- [ ] Subscription verification works correctly
- [ ] Free users see subscription modal after 2 pages
- [ ] Premium users can read unlimited
- [ ] Vocabulary limit enforced (20 words)
- [ ] Storage purchase modal shows at limit
- [ ] No deletion possible in vocabulary
- [ ] Page tracking excludes disclaimers
- [ ] Access logs record all attempts
- [ ] RLS policies prevent unauthorized access

## 📞 Support

For issues or questions about the subscription system, refer to:
- Database schema: `supabase/migrations/20250103000000_subscription_system.sql`
- Service layer: `src/lib/*Service.ts`
- React hooks: `src/hooks/useVocabularySecure.ts`

