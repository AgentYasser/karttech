import { Link } from "react-router-dom";
import {
  Settings,
  ChevronRight,
  BookOpen,
  Clock,
  Flame,
  Trophy,
  Star,
  Crown,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import { PersonalStatsCard } from "@/components/analytics/PersonalStatsCard";

const levelThresholds: Record<string, { min: number; max: number }> = {
  beginner: { min: 0, max: 500 },
  intermediate: { min: 501, max: 2000 },
  advanced: { min: 2001, max: 5000 },
  master: { min: 5001, max: 10000 },
  sage: { min: 10001, max: Infinity },
};

const Profile = () => {
  const { profile, signOut } = useAuth();
  const { data: userAchievements } = useUserAchievements();

  const userLevel = profile?.level || "beginner";
  const userPoints = profile?.points || 0;
  const currentLevel = levelThresholds[userLevel] || levelThresholds.beginner;

  const nextLevelEntry = Object.entries(levelThresholds).find(
    ([_, threshold]) => threshold.min > currentLevel.max
  );

  const levelProgress = currentLevel.max === Infinity
    ? 100
    : Math.min(((userPoints - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100, 100);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-4xl">
              {profile?.username?.charAt(0).toUpperCase() || "📖"}
            </div>

            <div className="flex-1">
              <h1 className="font-reading text-xl font-semibold text-card-foreground">
                {profile?.username || "Reader"}
              </h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>

              <div className="flex items-center gap-2 mt-2">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium capitalize",
                    userLevel === "beginner" && "bg-gray-100 text-gray-700",
                    userLevel === "intermediate" && "bg-blue-100 text-blue-700",
                    userLevel === "advanced" && "bg-purple-100 text-purple-700",
                    userLevel === "master" && "bg-amber-100 text-amber-700",
                    userLevel === "sage" && "bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800"
                  )}
                >
                  <Crown className="w-3 h-3 inline mr-1" />
                  {userLevel}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{userPoints.toLocaleString()} points</span>
              {nextLevelEntry && (
                <span>{nextLevelEntry[1].min.toLocaleString()} to {nextLevelEntry[0]}</span>
              )}
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up animation-delay-100">
          <div className="bg-card rounded-xl p-4 border border-border shadow-soft text-center">
            <BookOpen className="w-6 h-6 text-foreground mx-auto mb-2" />
            <span className="text-2xl font-bold text-card-foreground block">
              {profile?.books_completed || 0}
            </span>
            <span className="text-xs text-muted-foreground">Books Read</span>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-soft text-center">
            <Clock className="w-6 h-6 text-foreground mx-auto mb-2" />
            <span className="text-2xl font-bold text-card-foreground block">
              {profile?.chapters_read || 0}
            </span>
            <span className="text-xs text-muted-foreground">Chapters</span>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-soft text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <span className="text-2xl font-bold text-card-foreground block">
              {profile?.reading_streak || 0}
            </span>
            <span className="text-xs text-muted-foreground">Day Streak</span>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="animate-fade-up animation-delay-200">
          <PersonalStatsCard />
        </div>

        {/* Achievements */}
        <div className="animate-fade-up animation-delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-medium text-card-foreground">Achievements</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {userAchievements?.length || 0} unlocked
            </span>
          </div>

          {userAchievements && userAchievements.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {userAchievements.map((ua) => (
                <div
                  key={ua.id}
                  className="shrink-0 w-32 bg-card rounded-xl p-4 border border-border shadow-soft text-center"
                >
                  <span className="text-3xl block mb-2">🏆</span>
                  <h3 className="text-sm font-medium text-card-foreground line-clamp-1">
                    {ua.achievement?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{ua.achievement?.points_awarded} pts
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Start reading to unlock achievements!
              </p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-2 animate-fade-up animation-delay-300">
          <h2 className="font-medium text-card-foreground mb-3">Settings</h2>

          <Link
            to="/vocabulary"
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-card-foreground block">My Vocabulary</span>
              <span className="text-xs text-muted-foreground">Words you've learned</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          <Link
            to="/expert-sessions"
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-card-foreground block">Expert Sessions</span>
              <span className="text-xs text-muted-foreground">Connect with literary experts</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          {[
            { icon: CreditCard, label: "Subscription", subtitle: profile?.subscription_tier === "premium" ? "Premium" : "Free Plan" },
            { icon: Bell, label: "Notifications", subtitle: "Manage alerts" },
            { icon: Shield, label: "Privacy", subtitle: "Account security" },
            { icon: HelpCircle, label: "Help & Support", subtitle: "Get assistance" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-card-foreground block">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all duration-300 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-destructive block">Sign Out</span>
              <span className="text-xs text-muted-foreground">Log out of your account</span>
            </div>
          </button>
        </div>

        {/* Upgrade CTA */}
        {profile?.subscription_tier !== "premium" && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 animate-fade-up animation-delay-400">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-6 h-6 text-amber-600" />
              <h3 className="font-reading font-semibold text-amber-900">
                Upgrade to Premium
              </h3>
            </div>
            <p className="text-sm text-amber-800 mb-4">
              Get unlimited access to all books, exclusive discussions, and bonus points.
            </p>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              $4.99/month • Start Free Trial
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
