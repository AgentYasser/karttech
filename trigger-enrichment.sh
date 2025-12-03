#!/bin/bash
# Trigger library enrichment with Standard Ebooks and LibriVox

PROJECT_REF="pasinvieefirayqnfykj"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

echo "🎧 Step 1: Enriching with LibriVox audiobooks..."
echo "==============================================="

curl -X POST "${SUPABASE_URL}/functions/v1/import-books" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action": "enrich_with_audiobooks"}'

echo -e "\n\n"

echo "📚 Step 2: Enriching with Standard Ebooks..."
echo "============================================="

curl -X POST "${SUPABASE_URL}/functions/v1/import-books" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action": "enrich_with_standard_ebooks"}'

echo -e "\n\n✅ Enrichment complete!"

