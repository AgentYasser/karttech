import { useEffect, useState } from "react";
import { Bell, BookOpen, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
    id: string;
    text: string;
    type: 'book' | 'badge' | 'community' | 'expert';
    icon: React.ElementType;
}

const MOCK_NEWS: NewsItem[] = [
    { id: '1', text: "Sarah J. just finished 'Pride and Prejudice'", type: 'book', icon: BookOpen },
    { id: '2', text: "Community Goal: 85% to 1 Million Pages!", type: 'community', icon: Users },
    { id: '3', text: "New Expert Session: 'Modernism in 2024' with Dr. Vance", type: 'expert', icon: Bell },
    { id: '4', text: "Marcus T. earned the 'Bookworm' badge", type: 'badge', icon: Trophy },
    { id: '5', text: "Trending: 'The Great Gatsby' is up 200% this week", type: 'book', icon: BookOpen },
];

export function NewsTicker() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div
            className="bg-primary/5 border-b border-primary/10 h-10 overflow-hidden flex items-center relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground animate-marquee whitespace-nowrap" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
                {/* Duplicate items for seamless loop */}
                {[...MOCK_NEWS, ...MOCK_NEWS, ...MOCK_NEWS].map((item, i) => (
                    <div key={`${item.id}-${i}`} className="flex items-center gap-2 px-4">
                        <item.icon className="w-4 h-4 text-primary" />
                        <span>{item.text}</span>
                        <span className="text-primary/30 mx-2">•</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
