import { Lock, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseBook } from "@/hooks/useBookPurchase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface BookPaywallProps {
  bookId: string;
  bookTitle: string;
  pointsCost: number;
  earlyAccessUntil?: string | null;
}

export function BookPaywall({ bookId, bookTitle, pointsCost, earlyAccessUntil }: BookPaywallProps) {
  const { profile } = useAuth();
  const purchaseBook = usePurchaseBook();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const currentPoints = profile?.points || 0;
  const canAfford = currentPoints >= pointsCost;
  
  const handleUnlock = () => {
    purchaseBook.mutate({ bookId, pointsCost }, {
      onSuccess: () => setShowConfirm(false),
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="relative mt-8">
        {/* Gradient fade overlay */}
        <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        
        {/* Paywall card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-soft">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="font-reading text-xl font-semibold text-card-foreground mb-2">
            Continue Reading
          </h3>
          
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Unlock full access to "{bookTitle}" and enjoy the complete reading experience.
          </p>

          {earlyAccessUntil && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg py-2 px-4 mb-4 mx-auto w-fit">
              <Sparkles className="w-4 h-4" />
              <span>Early access until {formatDate(earlyAccessUntil)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-card-foreground">{pointsCost}</span>
            <span className="text-muted-foreground">points</span>
          </div>
          
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full max-w-xs gap-2"
              onClick={() => setShowConfirm(true)}
              disabled={!canAfford}
            >
              <Lock className="w-4 h-4" />
              Unlock Now
            </Button>
            
            {!canAfford && (
              <p className="text-sm text-muted-foreground">
                You have {currentPoints.toLocaleString()} points. 
                <br />
                Earn more by reading and participating in discussions!
              </p>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Your balance: <span className="font-semibold">{currentPoints.toLocaleString()} points</span>
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You're about to spend {pointsCost} points to unlock "{bookTitle}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 rounded-lg p-4 my-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Your balance</span>
              <span className="font-medium">{currentPoints.toLocaleString()} points</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Cost</span>
              <span className="font-medium text-destructive">-{pointsCost} points</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">After purchase</span>
                <span className="font-semibold">{(currentPoints - pointsCost).toLocaleString()} points</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleUnlock}
              disabled={purchaseBook.isPending}
            >
              {purchaseBook.isPending ? "Unlocking..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
