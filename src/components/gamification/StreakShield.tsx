import { useState, useEffect } from "react";
import { Shield, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StreakShield() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isHovered, setIsHovered] = useState(false);

    // Fetch shield count
    const { data: shieldCount = 0 } = useQuery({
        queryKey: ["streak-shields", user?.id],
        queryFn: async () => {
            if (!user) return 0;
            const { data, error } = await supabase
                .from("streak_shields")
                .select("shields_count")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== "PGRST116") throw error;
            return data?.shields_count || 0;
        },
        enabled: !!user,
    });

    // Purchase shield mutation
    const purchaseShield = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("Not authenticated");

            // 1. Check points balance
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("points")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;
            if ((profile?.points || 0) < 500) {
                throw new Error("Insufficient points (Need 500)");
            }

            // 2. Deduct points
            const { error: deductError } = await supabase
                .from("profiles")
                .update({ points: (profile?.points || 0) - 500 })
                .eq("id", user.id);

            if (deductError) throw deductError;

            // 3. Award shield (using existing RPC or direct insert/update)
            // Since we have award_streak_shield RPC, let's use it
            const { error: awardError } = await supabase.rpc("award_streak_shield", {
                p_user_id: user.id,
                p_count: 1,
            });

            if (awardError) throw awardError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["streak-shields"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] }); // Refresh points
            toast.success("Shield purchased! Your streak is safer now.");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (!user) return null;

    return (
        <div
            className="flex items-center gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                            shieldCount > 0
                                ? "bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-muted text-muted-foreground"
                        )}>
                            <Shield className={cn("w-4 h-4", shieldCount > 0 && "fill-current")} />

                            {/* Count badge */}
                            {shieldCount > 0 && (
                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-white text-indigo-600 rounded-full border border-indigo-100 shadow-sm">
                                    {shieldCount}
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">Streak Shields: {shieldCount}</p>
                        <p className="text-xs text-muted-foreground">Protects your streak if you miss a day.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Buy button - shows on hover or if 0 shields */}
            <div className={cn(
                "transition-all duration-300 overflow-hidden",
                (isHovered || shieldCount === 0) ? "w-auto opacity-100 ml-1" : "w-0 opacity-0"
            )}>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => purchaseShield.mutate()}
                    disabled={purchaseShield.isPending}
                >
                    <Plus className="w-3 h-3" />
                    <span className="whitespace-nowrap">Buy (500pts)</span>
                </Button>
            </div>
        </div>
    );
}
