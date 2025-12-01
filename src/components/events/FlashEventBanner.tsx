// Flash Event Banner - Shows active bonus events
import { useState } from "react";
import { Zap, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FlashEvent {
    id: string;
    title: string;
    description: string;
    multiplier: number;
    endsAt: Date;
    icon: string;
    color: string;
}

// Mock event - in real app, fetch from API
const MOCK_EVENT: FlashEvent = {
    id: '1',
    title: '2x Points on Shakespeare',
    description: 'Double points for reading Shakespeare plays this week!',
    multiplier: 2,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    icon: '📚',
    color: 'from-purple-500 to-pink-500',
};

interface FlashEventBannerProps {
    event?: FlashEvent;
    onDismiss?: () => void;
    className?: string;
}

export function FlashEventBanner({
    event = MOCK_EVENT,
    onDismiss,
    className
}: FlashEventBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    // Update countdown
    useState(() => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = event.endsAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Ended');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update every minute

        return () => clearInterval(interval);
    });

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-lg",
            className
        )}>
            {/* Gradient background */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-10",
                event.color
            )} />

            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />

            {/* Content */}
            <div className="relative bg-card/95 backdrop-blur-sm p-4">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                        "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl shrink-0 animate-pulse-soft",
                        event.color
                    )}>
                        {event.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-card-foreground">
                                {event.title}
                            </h3>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r",
                                event.color
                            )}>
                                {event.multiplier}x
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {event.description}
                        </p>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <Clock className="w-3 h-3" />
                                <span>Ends in</span>
                            </div>
                            <p className="text-sm font-bold text-card-foreground">
                                {timeLeft}
                            </p>
                        </div>

                        {onDismiss && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleDismiss}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add to index.css if needed:
/*
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shine {
  animation: shine 3s ease-in-out infinite;
}
*/
