// Pinterest-style Badge Gallery Component
import { Trophy, Flame, BookOpen, Users, Star, Sparkles, Calendar, Coins, Zap, MessageCircle } from "lucide-react";
import { useUserAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

const ACHIEVEMENT_ICONS: Record<string, any> = {
    reading_streak: Flame,
    book_completion: BookOpen,
    chapters_read: BookOpen,
    vocabulary_learned: Sparkles,
    discussions_created: MessageCircle,
    groups_joined: Users,
    daily_logins: Calendar,
    points_earned: Coins,
    default: Trophy,
};

const ACHIEVEMENT_COLORS: Record<string, string> = {
    reading_streak: "from-orange-500 to-red-500",
    book_completion: "from-blue-500 to-indigo-500",
    chapters_read: "from-green-500 to-emerald-500",
    vocabulary_learned: "from-purple-500 to-pink-500",
    discussions_created: "from-cyan-500 to-blue-500",
    groups_joined: "from-amber-500 to-yellow-500",
    daily_logins: "from-teal-500 to-green-500",
    points_earned: "from-yellow-500 to-orange-500",
    default: "from-gray-500 to-gray-600",
};

interface BadgeGalleryProps {
    className?: string;
}

export function BadgeGallery({ className }: BadgeGalleryProps) {
    const { data: achievements, isLoading } = useUserAchievements();

    if (isLoading) {
        return (
            <div className={cn("animate-pulse space-y-4", className)}>
                <div className="h-8 bg-muted rounded w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!achievements || achievements.length === 0) {
        return (
            <div className={cn("text-center py-12", className)}>
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                    No Achievements Yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Start reading, joining discussions, and completing books to unlock achievements and earn badges!
                </p>
            </div>
        );
    }

    // Group achievements by type for organized display
    const groupedAchievements = achievements.reduce((acc, ua) => {
        const type = ua.achievement?.requirement_type || 'default';
        if (!acc[type]) acc[type] = [];
        acc[type].push(ua);
        return acc;
    }, {} as Record<string, typeof achievements>);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-reading font-bold text-card-foreground">
                        Your Achievements
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {achievements.length} {achievements.length === 1 ? 'badge' : 'badges'} unlocked
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary">
                        {achievements.reduce((sum, ua) => sum + (ua.achievement?.points_awarded || 0), 0)} pts
                    </span>
                </div>
            </div>

            {/* Badge Gallery - Pinterest style masonry grid */}
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
                {achievements.map((userAchievement) => {
                    const achievement = userAchievement.achievement;
                    if (!achievement) return null;

                    const Icon = ACHIEVEMENT_ICONS[achievement.requirement_type] || ACHIEVEMENT_ICONS.default;
                    const colorClass = ACHIEVEMENT_COLORS[achievement.requirement_type] || ACHIEVEMENT_COLORS.default;
                    const unlockedDate = new Date(userAchievement.unlocked_at);

                    return (
                        <div
                            key={userAchievement.id}
                            className="break-inside-avoid mb-4"
                        >
                            <div className="group relative bg-card border-2 border-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                                {/* Gradient accent */}
                                <div className={cn(
                                    "absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r",
                                    colorClass
                                )} />

                                {/* Icon */}
                                <div className={cn(
                                    "w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center mb-4 mx-auto",
                                    colorClass
                                )}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <div className="text-center">
                                    <h3 className="font-semibold text-card-foreground mb-1 line-clamp-2">
                                        {achievement.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                                        {achievement.description}
                                    </p>

                                    {/* Points badge */}
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                                        <Coins className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-bold text-primary">
                                            +{achievement.points_awarded}
                                        </span>
                                    </div>

                                    {/* Unlock date */}
                                    <p className="text-[10px] text-muted-foreground mt-3">
                                        Unlocked {unlockedDate.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Shine effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                {Object.entries(groupedAchievements).map(([type, items]) => {
                    const Icon = ACHIEVEMENT_ICONS[type] || ACHIEVEMENT_ICONS.default;
                    const colorClass = ACHIEVEMENT_COLORS[type] || ACHIEVEMENT_COLORS.default;

                    return (
                        <div key={type} className="text-center">
                            <div className={cn(
                                "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-2",
                                colorClass
                            )}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-card-foreground">{items.length}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {type.replace('_', ' ')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
