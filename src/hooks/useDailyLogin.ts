import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAwardPoints } from "./usePoints";
import { toast } from "sonner";

export function useDailyLogin() {
  const queryClient = useQueryClient();
  const { user, profile, refreshProfile } = useAuth();
  const awardPoints = useAwardPoints();

  return useMutation({
    mutationFn: async () => {
      if (!user || !profile) return { awarded: false, streak: 0 };

      const today = new Date().toISOString().split("T")[0];
      const lastLogin = profile.last_login_date;

      // Already logged in today
      if (lastLogin === today) {
        return { awarded: false, streak: profile.reading_streak };
      }

      // Calculate streak
      let newStreak = 1;
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // Consecutive day
          newStreak = (profile.reading_streak || 0) + 1;
        }
        // If diffDays > 1, streak resets to 1
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          last_login_date: today,
          reading_streak: newStreak,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      return { awarded: true, streak: newStreak };
    },
    onSuccess: async (data) => {
      if (data.awarded) {
        // Award daily login points
        await awardPoints.mutateAsync({ source: "daily_login" });

        // Award streak bonus for milestone streaks
        if (data.streak === 7) {
          await awardPoints.mutateAsync({
            source: "reading_streak",
            customPoints: 50,
            customDescription: "7-day reading streak bonus!",
          });
        } else if (data.streak === 30) {
          await awardPoints.mutateAsync({
            source: "reading_streak",
            customPoints: 200,
            customDescription: "30-day reading streak bonus!",
          });
        }

        queryClient.invalidateQueries({ queryKey: ["profile"] });
        refreshProfile();
      }
    },
  });
}
