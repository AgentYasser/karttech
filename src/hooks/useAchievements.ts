import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_awarded: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      return data as (UserAchievement & { achievement: Achievement })[];
    },
    enabled: !!user,
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || !profile) return [];

      // Get all achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*");

      // Get user's existing achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const existingIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const newAchievements: Achievement[] = [];

      // Get counts for various requirements
      const [
        { count: vocabCount },
        { count: discussionCount },
        { count: groupCount },
      ] = await Promise.all([
        supabase.from("user_vocabulary").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("discussions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("group_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      for (const achievement of achievements || []) {
        if (existingIds.has(achievement.id)) continue;

        let qualified = false;

        switch (achievement.requirement_type) {
          case "chapters_read":
            qualified = (profile.chapters_read || 0) >= achievement.requirement_value;
            break;
          case "books_completed":
            qualified = (profile.books_completed || 0) >= achievement.requirement_value;
            break;
          case "vocabulary_learned":
            qualified = (vocabCount || 0) >= achievement.requirement_value;
            break;
          case "discussions_created":
            qualified = (discussionCount || 0) >= achievement.requirement_value;
            break;
          case "groups_joined":
            qualified = (groupCount || 0) >= achievement.requirement_value;
            break;
          case "reading_streak":
            qualified = (profile.reading_streak || 0) >= achievement.requirement_value;
            break;
          case "points_earned":
            qualified = (profile.points || 0) >= achievement.requirement_value;
            break;
        }

        if (qualified) {
          const { error } = await supabase
            .from("user_achievements")
            .insert({ user_id: user.id, achievement_id: achievement.id });

          if (!error) {
            newAchievements.push(achievement);
          }
        }
      }

      return newAchievements;
    },
    onSuccess: (newAchievements) => {
      queryClient.invalidateQueries({ queryKey: ["user_achievements"] });
      
      for (const achievement of newAchievements) {
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `+${achievement.points_awarded} points`,
        });
      }
    },
  });
}
