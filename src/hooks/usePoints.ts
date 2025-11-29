import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type PointSource = 
  | "reading_chapter" 
  | "completing_book" 
  | "discussion_created" 
  | "discussion_upvote" 
  | "reading_streak" 
  | "vocabulary_learned"
  | "group_joined"
  | "daily_login";

const POINT_VALUES: Record<PointSource, number> = {
  reading_chapter: 10,
  completing_book: 100,
  discussion_created: 25,
  discussion_upvote: 5,
  reading_streak: 50,
  vocabulary_learned: 5,
  group_joined: 20,
  daily_login: 10,
};

const POINT_DESCRIPTIONS: Record<PointSource, string> = {
  reading_chapter: "Completed a chapter",
  completing_book: "Finished reading a book",
  discussion_created: "Started a new discussion",
  discussion_upvote: "Received an upvote",
  reading_streak: "Maintained reading streak",
  vocabulary_learned: "Learned a new word",
  group_joined: "Joined a reading group",
  daily_login: "Daily login bonus",
};

export function useAwardPoints() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      source, 
      customPoints,
      customDescription 
    }: { 
      source: PointSource; 
      customPoints?: number;
      customDescription?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const points = customPoints ?? POINT_VALUES[source];
      const description = customDescription ?? POINT_DESCRIPTIONS[source];

      // Create points transaction
      const { error: transactionError } = await supabase
        .from("points_transactions")
        .insert({
          user_id: user.id,
          points,
          transaction_type: "earned",
          source,
          description,
        });

      if (transactionError) throw transactionError;

      // Update user's total points
      const { data: profile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("points, level")
        .eq("id", user.id)
        .single();

      if (profileFetchError) throw profileFetchError;

      const newPoints = (profile.points || 0) + points;
      const newLevel = calculateLevel(newPoints);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          points: newPoints,
          level: newLevel,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      return { points, newTotal: newPoints, newLevel, leveledUp: newLevel !== profile.level };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
      
      if (data.leveledUp) {
        toast.success(`Level up! You're now ${data.newLevel}!`, {
          description: `+${data.points} points earned`,
        });
      } else {
        toast.success(`+${data.points} points earned!`);
      }
    },
    onError: (error) => {
      console.error("Points error:", error);
    },
  });
}

function calculateLevel(points: number): string {
  if (points >= 10001) return "sage";
  if (points >= 5001) return "master";
  if (points >= 2001) return "advanced";
  if (points >= 501) return "intermediate";
  return "beginner";
}

export function useSpendPoints() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      points, 
      description 
    }: { 
      points: number; 
      description: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if user has enough points
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;
      if ((profile.points || 0) < points) {
        throw new Error("Insufficient points");
      }

      // Create points transaction
      const { error: transactionError } = await supabase
        .from("points_transactions")
        .insert({
          user_id: user.id,
          points: -points,
          transaction_type: "spent",
          source: "purchase",
          description,
        });

      if (transactionError) throw transactionError;

      // Update user's total points
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: (profile.points || 0) - points })
        .eq("id", user.id);

      if (updateError) throw updateError;

      return { pointsSpent: points, newTotal: (profile.points || 0) - points };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
      toast.info(`Spent ${data.pointsSpent} points`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to spend points");
    },
  });
}
