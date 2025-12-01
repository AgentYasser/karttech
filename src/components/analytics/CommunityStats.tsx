import { useEffect, useState } from "react";
import { BookOpen, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatProps {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 transform",
                    color,
                    isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                    <p className={cn(
                        "text-2xl font-bold font-reading transition-all duration-700 transform",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}>
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export function CommunityStats() {
    // In a real app, fetch these from the get_community_stats RPC function
    const stats = {
        totalBooks: "12,450",
        totalMinutes: "850k+",
        activeReaders: "1,240"
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card/50 rounded-2xl border border-border/50 p-2 backdrop-blur-sm">
            <StatCard
                label="Books Completed"
                value={stats.totalBooks}
                icon={BookOpen}
                color="bg-blue-500"
                delay={100}
            />
            <StatCard
                label="Minutes Read"
                value={stats.totalMinutes}
                icon={Clock}
                color="bg-purple-500"
                delay={300}
            />
            <StatCard
                label="Active Readers"
                value={stats.activeReaders}
                icon={Users}
                color="bg-green-500"
                delay={500}
            />
        </div>
    );
}
