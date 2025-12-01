-- Phase 8: Legal & Compliance
-- GDPR Data Export and Account Deletion Functions

-- Function to export all user data (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow users to export their own data
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only export your own data';
  END IF;

  SELECT jsonb_build_object(
    'profile', (
      SELECT to_jsonb(p.*)
      FROM profiles p
      WHERE p.id = target_user_id
    ),
    'reading_sessions', (
      SELECT jsonb_agg(to_jsonb(rs.*))
      FROM reading_sessions rs
      WHERE rs.user_id = target_user_id
    ),
    'library_books', (
      SELECT jsonb_agg(jsonb_build_object(
        'book_id', lb.book_id,
        'status', lb.status,
        'progress', lb.progress,
        'added_at', lb.added_at,
        'book_title', b.title,
        'book_author', b.author
      ))
      FROM library_books lb
      JOIN books b ON b.id = lb.book_id
      WHERE lb.user_id = target_user_id
    ),
    'group_memberships', (
      SELECT jsonb_agg(jsonb_build_object(
        'group_id', gm.group_id,
        'role', gm.role,
        'joined_at', gm.joined_at,
        'group_name', rg.name
      ))
      FROM group_members gm
      JOIN reading_groups rg ON rg.id = gm.group_id
      WHERE gm.user_id = target_user_id
    ),
    'points_transactions', (
      SELECT jsonb_agg(to_jsonb(pt.*))
      FROM points_transactions pt
      WHERE pt.user_id = target_user_id
    ),
    'exported_at', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete in order to respect foreign key constraints
  DELETE FROM notifications WHERE user_id = user_id;
  DELETE FROM points_transactions WHERE user_id = user_id;
  DELETE FROM group_members WHERE user_id = user_id;
  DELETE FROM library_books WHERE user_id = user_id;
  DELETE FROM reading_sessions WHERE user_id = user_id;
  DELETE FROM user_achievements WHERE user_id = user_id;
  DELETE FROM daily_quests WHERE user_id = user_id;
  DELETE FROM streak_shields WHERE user_id = user_id;
  
  -- Delete groups created by user (will cascade to group_members)
  DELETE FROM reading_groups WHERE created_by = user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = user_id;
  
  -- Note: Supabase auth.users deletion must be handled separately via auth API
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION export_user_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

COMMENT ON FUNCTION export_user_data IS 'GDPR compliance: Export all user data as JSON';
COMMENT ON FUNCTION delete_user_account IS 'GDPR compliance: Delete user account and all associated data';
