import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Zap, Target } from "lucide-react";

export function PersonalStatsCard() {
    // Mock data - replace with real user stats
    const stats = {
        booksRead: 12,
        pagesRead: 3450,
        readingStreak: 5,
        avgSpeed: "250 wpm",
        genreDistribution: [
            { name: "Fiction", value: 60 },
            { name: "History", value: 25 },
            { name: "Sci-Fi", value: 15 },
        ]
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-reading flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Reading Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Books Read</p>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-2xl font-bold">{stats.booksRead}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pages Turned</p>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-2xl font-bold">{stats.pagesRead}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium">Genre Distribution</p>
                    <div className="space-y-2">
                        {stats.genreDistribution.map((genre) => (
                            <div key={genre.name} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>{genre.name}</span>
                                    <span>{genre.value}%</span>
                                </div>
                                <Progress value={genre.value} className="h-2" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Avg Speed</span>
                    </div>
                    <span className="font-bold">{stats.avgSpeed}</span>
                </div>
            </CardContent>
        </Card>
    );
}
