-- Phase 6: Groups Enhancement - Database Schema

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('group_invite', 'new_group', 'system', 'achievement')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Function to join group with capacity check
CREATE OR REPLACE FUNCTION join_group(group_id_param uuid)
RETURNS json AS $$
DECLARE
  current_count int;
  max_count int;
  is_member boolean;
BEGIN
  -- Check if already member
  SELECT exists(SELECT 1 FROM group_members WHERE group_id = group_id_param AND user_id = auth.uid())
  INTO is_member;
  
  IF is_member THEN
    RETURN json_build_object('success', false, 'message', 'Already a member');
  END IF;

  -- Check capacity
  SELECT count(*) INTO current_count FROM group_members WHERE group_id = group_id_param;
  SELECT max_members INTO max_count FROM reading_groups WHERE id = group_id_param;
  
  IF current_count >= max_count THEN
    RETURN json_build_object('success', false, 'message', 'Group is full');
  END IF;

  -- Insert member
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (group_id_param, auth.uid(), 'member');
  
  RETURN json_build_object('success', true, 'message', 'Joined successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION join_group(uuid) TO postgres, anon, authenticated, service_role;

-- 3. Trigger to create notification when a new group is created (optional, for demo)
-- This is a bit heavy for production (notifying everyone), but good for small community demo
CREATE OR REPLACE FUNCTION notify_new_group()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify only the first 100 users to avoid performance issues in this demo
  INSERT INTO notifications (user_id, title, message, type)
  SELECT id, 'New Group Created', 'Check out "' || NEW.name || '"!', 'new_group'
  FROM profiles
  WHERE id != NEW.created_by
  LIMIT 100;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON reading_groups
  FOR EACH ROW EXECUTE FUNCTION notify_new_group();
