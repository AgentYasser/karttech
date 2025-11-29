import { mockUser } from "@/data/mockData";
import { Flame, Trophy } from "lucide-react";

export function WelcomeCard() {
  const greeting = getGreeting();

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{greeting}</p>
          <h1 className="font-reading text-2xl font-semibold text-card-foreground mt-1">
            {mockUser.username}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 capitalize">
            Level: <span className="text-foreground font-medium">{mockUser.level}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center bg-primary/50 px-3 py-2 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold text-card-foreground">{mockUser.readingStreak}</span>
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <div className="flex flex-col items-center bg-secondary/50 px-3 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-bold text-card-foreground">{mockUser.booksCompleted}</span>
            <span className="text-xs text-muted-foreground">Books</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}
