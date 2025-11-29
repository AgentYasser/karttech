import { Link } from "react-router-dom";
import { BookOpen, MessageSquarePlus, Users } from "lucide-react";

const actions = [
  {
    label: "Start Reading",
    icon: BookOpen,
    path: "/library",
    color: "bg-primary hover:bg-soft-blue-hover",
  },
  {
    label: "Join Discussion",
    icon: MessageSquarePlus,
    path: "/discussions",
    color: "bg-secondary hover:bg-gentle-green-hover",
  },
  {
    label: "Create Group",
    icon: Users,
    path: "/groups",
    color: "bg-card hover:bg-muted border border-border",
  },
];

export function QuickActions() {
  return (
    <div className="animate-fade-up animation-delay-400">
      <h2 className="font-medium text-card-foreground mb-4">Quick Actions</h2>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.path}
              to={action.path}
              className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 ${action.color}`}
            >
              <Icon className="w-6 h-6 text-card-foreground mb-2" />
              <span className="text-xs font-medium text-card-foreground text-center">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
