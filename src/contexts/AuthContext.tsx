import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  level: string;
  reading_streak: number;
  books_completed: number;
  chapters_read: number;
  bio: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  last_login_date: string | null;
  role?: 'admin' | 'moderator' | 'member';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const dailyLoginChecked = useRef(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data && !error) {
      setProfile(data as Profile);
      return data as Profile;
    }
    return null;
  };

  const checkDailyLogin = async (userId: string, currentProfile: Profile | null) => {
    if (dailyLoginChecked.current || !currentProfile) return;
    dailyLoginChecked.current = true;

    const today = new Date().toISOString().split("T")[0];
    const lastLogin = currentProfile.last_login_date;

    if (lastLogin === today) return;

    // Calculate streak
    let newStreak = 1;
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        newStreak = (currentProfile.reading_streak || 0) + 1;
      }
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        last_login_date: today,
        reading_streak: newStreak,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (!error) {
      // Award daily login points
      await supabase.from("points_transactions").insert({
        user_id: userId,
        points: 10,
        transaction_type: "earned",
        source: "daily_login",
        description: "Daily login bonus",
      });

      // Update user's total points
      const newPoints = (currentProfile.points || 0) + 10;
      await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", userId);

      toast.success(`+10 points - Daily login bonus!`, {
        description: `${newStreak} day streak 🔥`,
      });

      // Award streak bonus for milestones
      if (newStreak === 7) {
        await supabase.from("points_transactions").insert({
          user_id: userId,
          points: 50,
          transaction_type: "earned",
          source: "reading_streak",
          description: "7-day reading streak bonus!",
        });
        await supabase
          .from("profiles")
          .update({ points: newPoints + 50 })
          .eq("id", userId);
        toast.success("🎉 7-day streak bonus: +50 points!");
      } else if (newStreak === 30) {
        await supabase.from("points_transactions").insert({
          user_id: userId,
          points: 200,
          transaction_type: "earned",
          source: "reading_streak",
          description: "30-day reading streak bonus!",
        });
        await supabase
          .from("profiles")
          .update({ points: newPoints + 200 })
          .eq("id", userId);
        toast.success("🏆 30-day streak bonus: +200 points!");
      }

      // Refresh profile
      fetchProfile(userId);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            if (profileData) {
              checkDailyLogin(session.user.id, profileData);
            }
          }, 0);
        } else {
          setProfile(null);
          dailyLoginChecked.current = false;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (profileData) {
          checkDailyLogin(session.user.id, profileData);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
