// Book Completion Celebration Component - Dancing Disco Panda
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookCompletionCelebrationProps {
    bookTitle: string;
    author: string;
    pointsEarned: number;
    onClose: () => void;
    onShare?: () => void;
}

export function BookCompletionCelebration({
    bookTitle,
    author,
    pointsEarned,
    onClose,
    onShare,
}: BookCompletionCelebrationProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setShow(true), 100);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
                show ? "bg-black/80 backdrop-blur-sm" : "bg-black/0"
            )}
            onClick={handleClose}
        >
            {/* Confetti background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    >
                        {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
                    </div>
                ))}
            </div>

            {/* Main celebration card */}
            <div
                className={cn(
                    "relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-1 max-w-md w-full transition-all duration-500",
                    show ? "scale-100 opacity-100" : "scale-50 opacity-0"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-card rounded-3xl p-8 relative overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Dancing Disco Panda */}
                    <div className="text-center mb-6">
                        <div className="text-8xl mb-4 animate-bounce-slow">
                            🐼
                        </div>
                        <div className="flex justify-center gap-2 mb-4">
                            <span className="text-4xl animate-pulse">🪩</span>
                            <span className="text-4xl animate-pulse animation-delay-200">💿</span>
                            <span className="text-4xl animate-pulse animation-delay-400">🎵</span>
                        </div>
                    </div>

                    {/* Celebration message */}
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            <h2 className="text-2xl font-reading font-bold text-card-foreground">
                                Book Complete!
                            </h2>
                            <Trophy className="w-6 h-6 text-amber-500" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-card-foreground line-clamp-2">
                                {bookTitle}
                            </p>
                            <p className="text-sm text-muted-foreground">by {author}</p>
                        </div>

                        {/* Points earned */}
                        <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-4 my-6">
                            <div className="flex items-center justify-center gap-2">
                                <Sparkles className="w-6 h-6 text-primary" />
                                <span className="text-3xl font-bold text-primary">
                                    +{pointsEarned}
                                </span>
                                <span className="text-lg text-muted-foreground">points</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Amazing work! Keep reading to unlock more achievements.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={onShare}
                                variant="soft"
                                className="flex-1 gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                            <Button
                                onClick={handleClose}
                                variant="default"
                                className="flex-1"
                            >
                                Continue Reading
                            </Button>
                        </div>
                    </div>

                    {/* Disco floor effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// Add these to your global CSS file (index.css)
/*
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

.animate-confetti {
  animation: confetti linear infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
*/
