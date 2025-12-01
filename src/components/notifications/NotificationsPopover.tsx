import { Bell, Check, Info, Users, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'group_invite' | 'new_group' | 'system' | 'achievement';
    is_read: boolean;
    created_at: string;
}

export function NotificationsPopover() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
        refetchInterval: 30000, // Poll every 30s
    });

    const markAsRead = useMutation({
        mutationFn: async (ids: string[]) => {
            if (!user || ids.length === 0) return;
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            // Mark all as read when opening (or maybe just on a button click? Let's do button click for now or auto-mark)
            // For better UX, let's keep them unread until user interacts or clicks "Mark all read"
        }
    };

    const handleMarkAllRead = () => {
        const unreadIds = notifications?.filter(n => !n.is_read).map(n => n.id) || [];
        markAsRead.mutate(unreadIds);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'group_invite': return <Users className="w-4 h-4 text-blue-500" />;
            case 'new_group': return <Sparkles className="w-4 h-4 text-green-500" />;
            case 'achievement': return <Trophy className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                            onClick={handleMarkAllRead}
                            disabled={markAsRead.isPending}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications?.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications?.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors flex gap-3",
                                        !notification.is_read && "bg-primary/5"
                                    )}
                                >
                                    <div className="mt-1 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.is_read && "font-semibold")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground pt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="shrink-0 self-center">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
