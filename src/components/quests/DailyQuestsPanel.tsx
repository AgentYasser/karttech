// Daily Quests Panel - Subtle, non-intrusive quest tracker
import { useEffect, useState } from "react";
import { Check, Target, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Quest {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    pointsReward: number;
    icon: string;
    completed: boolean;
}

// Mock quests - in real app, fetch from API
const DAILY_QUESTS: Quest[] = [
    {
        id: '1',
        title: 'Daily Reading',
        description: 'Read for 10 minutes',
        progress: 0,
        target: 10,
        pointsReward: 10,
        icon: '📖',
        completed: false,
    },
    {
        id: '2',
        title: 'Vocabulary Builder',
        description: 'Look up 3 new words',
        progress: 0,
        target: 3,
        pointsReward: 15,
        icon: '✨',
        completed: false,
    },
    {
        id: '3',
        title: 'Join the Conversation',
        description: 'Leave a comment',
        progress: 0,
        target: 1,
        pointsReward: 20,
        icon: '💬',
        completed: false,
    },
];

interface DailyQuestsPanelProps {
    className?: string;
    onQuestComplete?: (questId: string, points: number) => void;
}

export function DailyQuestsPanel({ className, onQuestComplete }: DailyQuestsPanelProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [quests, setQuests] = useState<Quest[]>(DAILY_QUESTS);

    const completedCount = quests.filter(q => q.completed).length;
    const totalPoints = quests.reduce((sum, q) => sum + (q.completed ? q.pointsReward : 0), 0);

    useEffect(() => {
        // Check for quest completion
        quests.forEach(quest => {
            if (!quest.completed && quest.progress >= quest.target) {
                quest.completed = true;
                onQuestComplete?.(quest.id, quest.pointsReward);
            }
        });
    }, [quests, onQuestComplete]);

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-40 w-80 transition-all duration-300",
            className
        )}>
            {/* Header - Always visible */}
            <div
                className={cn(
                    "bg-card border-2 border-border rounded-t-2xl px-4 py-3 cursor-pointer hover:bg-accient/50 transition-colors",
                    isMinimized && "rounded-b-2xl"
                )}
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold text-sm text-card-foreground">
                                Daily Quests
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {completedCount}/{quests.length} complete
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {totalPoints > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs font-bold text-primary">+{totalPoints}</span>
                            </div>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            {isMinimized ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quest List */}
            {!isMinimized && (
                <div className="bg-card border-2 border-t-0 border-border rounded-b-2xl p-4 space-y-3 max-h-96 overflow-y-auto">
                    {quests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                    ))}

                    {completedCount === quests.length && (
                        <div className="text-center py-4 border-t border-border mt-4">
                            <p className="text-sm font-medium text-card-foreground mb-1">
                                🎉 All quests complete!
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Come back tomorrow for new challenges
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function QuestCard({ quest }: { quest: Quest }) {
    const progressPercent = (quest.progress / quest.target) * 100;

    return (
        <div className={cn(
            "p-3 rounded-xl border transition-all",
            quest.completed
                ? "bg-primary/5 border-primary/30"
                : "bg-muted/30 border-border"
        )}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0",
                    quest.completed ? "bg-primary/20" : "bg-muted"
                )}>
                    {quest.completed ? '✓' : quest.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                quest.completed ? "text-primary" : "text-card-foreground"
                            )}>
                                {quest.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {quest.description}
                            </p>
                        </div>

                        <div className="text-xs font-bold text-primary shrink-0">
                            +{quest.pointsReward}pts
                        </div>
                    </div>

                    {/* Progress bar */}
                    {!quest.completed && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{quest.progress} / {quest.target}</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {quest.completed && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                            <Check className="w-3 h-3" />
                            <span>Completed!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
