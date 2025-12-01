// Word Streak Counter - tracks consecutive word lookups and awards points
import { useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakShield } from "@/components/gamification/StreakShield";

interface WordStreakCounterProps {
    streak: number;
    onStreakMilestone?: (milestone: number) => void;
    className?: string;
}

const STREAK_MILESTONE = 5; // Award points every 5 words
const POINTS_PER_MILESTONE = 25;

export function WordStreakCounter({
    streak,
    onStreakMilestone,
    className
}: WordStreakCounterProps) {
    const [showCelebration, setShowCelebration] = useState(false);
    const [lastMilestone, setLastMilestone] = useState(0);

    useEffect(() => {
        // Check if we hit a new milestone
        const currentMilestone = Math.floor(streak / STREAK_MILESTONE);
        const prevMilestone = Math.floor(lastMilestone / STREAK_MILESTONE);

        if (currentMilestone > prevMilestone && streak >= STREAK_MILESTONE) {
            setShowCelebration(true);
            onStreakMilestone?.(currentMilestone * STREAK_MILESTONE);

            // Hide celebration after 3 seconds
            setTimeout(() => setShowCelebration(false), 3000);
        }

        setLastMilestone(streak);
    }, [streak, lastMilestone, onStreakMilestone]);

    const progress = (streak % STREAK_MILESTONE) / STREAK_MILESTONE * 100;
    const completedMilestones = Math.floor(streak / STREAK_MILESTONE);

    // Don't show if streak is 0
    if (streak === 0) return null;

    return (
        <div className={cn("fixed bottom-24 right-4 z-50", className)}>
            {showCelebration && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap animate-bounce">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Curious Mind! +{POINTS_PER_MILESTONE}pts</span>
                </div>
            )}

            <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 shadow-xl min-w-[140px] animate-fade-up">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Word Streak</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-card-foreground">{streak}</p>
                            <StreakShield />
                        </div>
                    </div>
                </div>

                {/* Progress bar to next milestone */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{streak % STREAK_MILESTONE}/{STREAK_MILESTONE}</span>
                        <span>+{POINTS_PER_MILESTONE}pts</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Completed milestones */}
                {completedMilestones > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Milestones</p>
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: Math.min(completedMilestones, 10) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
                                >
                                    ✓
                                </div>
                            ))}
                            {completedMilestones > 10 && (
                                <div className="w-6 h-6 rounded-full bg-primary/70 flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                                    +{completedMilestones - 10}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
