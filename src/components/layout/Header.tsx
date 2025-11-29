import { Coins, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/data/mockData";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-lg">📖</span>
          </div>
          <span className="font-reading text-lg font-semibold text-card-foreground">
            Read With Us
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="points" size="sm" className="gap-1.5">
            <Coins className="w-4 h-4" />
            <span className="font-semibold">{mockUser.points.toLocaleString()}</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
