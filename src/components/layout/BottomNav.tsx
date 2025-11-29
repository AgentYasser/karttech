import { Link, useLocation } from "react-router-dom";
import { Book, Library, Mic, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Book, label: "Home" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/audio-rooms", icon: Mic, label: "Audio" },
  { path: "/groups", icon: Users, label: "Groups" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-card">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                isActive
                  ? "text-soft-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive && "bg-primary shadow-soft"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
