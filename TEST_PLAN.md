# 🧪 TEST PLAN - Before Deployment

## Applying: Timeless Excellence + Journalist Method + Framework Logic

---

## ✅ Phase 1: Local Testing (Manual - Requires Supabase)

### **Test 1: Database Migration**
```bash
# Apply migration to create system_config table
cd /Users/wajeddoumani/Projects/karttech
supabase db push

# OR manually run migration in Supabase dashboard:
# Copy contents of: supabase/migrations/20251203100000_add_import_status.sql
# Paste in SQL Editor and execute
```

**Expected Result**:
- ✅ `system_config` table created
- ✅ Initial rows inserted (book_import_status, book_import_progress)

**Verification**:
```sql
SELECT * FROM system_config;
-- Should show:
-- | config_key | config_value | created_at | updated_at |
-- | book_import_status | pending | ... | ... |
-- | book_import_progress | {"current": 0, "total": 0, "errors": []} | ... | ... |
```

---

### **Test 2: Edge Function Deployment**
```bash
# Deploy Edge Function to Supabase
supabase functions deploy import-books

# OR use Supabase dashboard:
# 1. Go to Edge Functions
# 2. Create new function "import-books"
# 3. Copy contents of: supabase/functions/import-books/index.ts
# 4. Deploy
```

**Expected Result**:
- ✅ Function deployed successfully
- ✅ Function URL: `https://[project-ref].supabase.co/functions/v1/import-books`

---

### **Test 3: Single Book Import (CRITICAL)**
```bash
# Test with 1 book first (Pride and Prejudice)
# Use Supabase Functions tab > Test

# Request body:
{
  "action": "fetch_book_content",
  "gutenberg_id": 1342,
  "book_id": "[get from books table]"
}
```

**Expected Result**:
```json
{
  "success": true,
  "chapters_created": 61,
  "book_id": "..."
}
```

**Verification**:
```sql
-- Check chapters were created
SELECT COUNT(*) FROM chapters WHERE book_id = '[book_id]';
-- Should return 61

-- Check book marked as available
SELECT content_available FROM books WHERE id = '[book_id]';
-- Should return true
```

**If This Fails**:
- ❌ Check Edge Function logs for errors
- ❌ Verify Gutenberg ID is valid
- ❌ Check RLS policies allow service_role inserts

---

### **Test 4: Bulk Import (If Test 3 Passes)**
```bash
# Trigger bulk import via Edge Function
# Request body:
{
  "action": "import_all_content"
}
```

**Expected Result**:
```json
{
  "success": true,
  "imported": 48,
  "failed": 2,
  "total": 50,
  "errors": [
    { "book": "Some Book", "error": "..." }
  ]
}
```

**Monitor**:
- Watch Edge Function logs in real-time
- Check `system_config.book_import_progress` updates

**Verification**:
```sql
-- Check import status
SELECT config_value FROM system_config WHERE config_key = 'book_import_status';
-- Should return 'complete'

-- Count books with content
SELECT COUNT(*) FROM books WHERE content_available = true;
-- Should be close to 50

-- Count total chapters
SELECT COUNT(*) FROM chapters;
-- Should be 500+ (varies by book)
```

---

## ✅ Phase 2: Client-Side Integration Test

### **Test 5: Client Calls Edge Function**
```typescript
// In browser console after app loads:
// Test checkImportStatus()
const status = await (await import('./utils/autoImportBooks')).checkImportStatus();
console.log('Import status:', status);
// Expected: 'pending' (before first run) or 'complete' (after)

// Test triggerBulkImport()
const result = await (await import('./utils/autoImportBooks')).triggerBulkImport();
console.log('Import result:', result);
// Expected: { success: true, message: '...' }
```

**Expected Behavior**:
- ✅ No CORS errors in console
- ✅ Function returns within 5-10 seconds (or longer for full import)
- ✅ Books populate in library

---

## ✅ Phase 3: User Experience Test

### **Test 6: First-Time User Flow**
1. Clear browser cache/localStorage
2. Open app in incognito window
3. Sign up / log in
4. Navigate to `/library`

**Expected Experience**:
- ✅ Library page loads immediately
- ✅ Books visible (metadata from migration)
- ✅ No browser console errors
- ✅ No frozen/hanging browser
- ✅ Can click books and see chapters (after import completes)

**Check Console Logs**:
```
📚 Checking book import status...
🚀 Starting server-side book import...
✅ Successfully imported X books
```

---

### **Test 7: Subsequent User Visit**
1. Refresh the page
2. Check console logs

**Expected**:
```
📚 Checking book import status...
✅ Books already imported
```

**Verification**:
- ✅ No redundant import triggered
- ✅ Library loads instantly
- ✅ All books have readable content

---

## ✅ Phase 4: Error Handling Tests

### **Test 8: Invalid Gutenberg ID**
```bash
# Trigger with bad ID
{
  "action": "fetch_book_content",
  "gutenberg_id": 99999999,
  "book_id": "[valid book id]"
}
```

**Expected Result**:
```json
{
  "error": "Failed to fetch book content",
  "details": "Could not fetch book content from either URL (status: 404)"
}
```

**Verification**:
- ✅ Function doesn't crash
- ✅ Error logged properly
- ✅ Other books continue processing

---

### **Test 9: Network Failure Simulation**
1. Disconnect internet midway through import
2. Check status in DB

**Expected**:
- ✅ Partial success (some books imported)
- ✅ Status reset to 'pending' (allows retry)
- ✅ Errors tracked in `book_import_progress`

---

## ✅ Phase 5: Performance Tests

### **Test 10: Load Testing**
```bash
# Check Edge Function execution time
# Monitor in Supabase dashboard:
# Functions > import-books > Logs > Execution time
```

**Expected**:
- ✅ Single book: < 5 seconds
- ✅ Full import (50 books): 2-5 minutes
- ✅ No timeout errors (Supabase limit: 60 seconds per invocation)

**If Timeout Occurs**:
- Split into smaller batches (10 books at a time)
- Use async processing with queue

---

## ✅ Phase 6: Security Tests

### **Test 11: RLS Policies**
```sql
-- Try to update system_config as regular user (should fail)
-- In browser console:
const { error } = await supabase
  .from('system_config')
  .update({ config_value: 'hacked' })
  .eq('config_key', 'book_import_status');

console.log(error); // Should show permission denied
```

**Expected**:
- ❌ Update blocked by RLS
- ✅ Only service_role can update

---

### **Test 12: Idempotency**
```bash
# Call import_all_content twice in a row
# Second call should return immediately without re-importing
```

**Expected**:
```json
{
  "success": true,
  "message": "Import already completed",
  "imported": 0
}
```

---

## 📋 Testing Checklist Summary

### Before Deployment:
- [ ] **Test 1**: Migration applied ✅
- [ ] **Test 2**: Edge Function deployed ✅
- [ ] **Test 3**: Single book import works ✅ (CRITICAL)
- [ ] **Test 4**: Bulk import completes ✅
- [ ] **Test 5**: Client integration works ✅
- [ ] **Test 6**: UX is seamless ✅
- [ ] **Test 7**: No redundant imports ✅
- [ ] **Test 8**: Error handling works ✅
- [ ] **Test 9**: Retry capability works ✅
- [ ] **Test 10**: Performance acceptable ✅
- [ ] **Test 11**: Security intact ✅
- [ ] **Test 12**: Idempotent behavior ✅

### After Deployment:
- [ ] Monitor Edge Function logs for 24 hours
- [ ] Check error rates in Supabase dashboard
- [ ] Verify user feedback (no complaints about empty library)
- [ ] Confirm all 50 books have content in production DB

---

## 🚨 Rollback Criteria

**If ANY of these occur, rollback immediately:**
1. ❌ Test 3 (single book) fails → Don't deploy
2. ❌ More than 50% of books fail import
3. ❌ Edge Function times out repeatedly
4. ❌ RLS policies blocking legitimate operations
5. ❌ User experience degraded (frozen browser, CORS errors)

**Rollback Steps:**
1. Revert client code to previous version
2. Update `book_import_status` to 'pending' (allows manual retry)
3. Debug locally before re-deploying

---

## ✅ Success Criteria

**Deploy ONLY if:**
- ✅ Test 3 (single book) passes
- ✅ At least 80% of books import successfully
- ✅ No CORS errors in browser console
- ✅ User can read books immediately after import
- ✅ Error handling prevents cascading failures

---

**Status**: ⏳ **READY FOR TESTING**

**Next Action**: Run Test 1-3 manually in Supabase dashboard before proceeding to deployment.

**Estimated Testing Time**: 30-45 minutes

**Methodology Applied**: Timeless Excellence (fail fast, iterate safely) ✨

