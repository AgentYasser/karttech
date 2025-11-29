import { useState } from "react";
import { Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAwardDiscussionPoints } from "@/hooks/useDiscussionRooms";
import { cn } from "@/lib/utils";

interface AwardPointsDialogProps {
  roomId: string;
  toUserId: string;
  toUsername: string;
  children: React.ReactNode;
}

const POINT_OPTIONS = [5, 10, 15, 20, 50] as const;

export function AwardPointsDialog({
  roomId,
  toUserId,
  toUsername,
  children,
}: AwardPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<5 | 10 | 15 | 20 | 50>(10);
  const [reason, setReason] = useState("");

  const awardPoints = useAwardDiscussionPoints();

  const handleAward = async () => {
    try {
      await awardPoints.mutateAsync({
        roomId,
        toUserId,
        points: selectedPoints,
        reason: reason.trim() || undefined,
      });
      setOpen(false);
      setSelectedPoints(10);
      setReason("");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-reading flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Award Points to {toUsername}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Points</Label>
            <div className="flex gap-2 flex-wrap">
              {POINT_OPTIONS.map((points) => (
                <Button
                  key={points}
                  variant={selectedPoints === points ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPoints(points)}
                  className={cn(
                    "min-w-[60px]",
                    selectedPoints === points && "bg-amber-500 hover:bg-amber-600"
                  )}
                >
                  +{points}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Great insight about the character development..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAward}
              disabled={awardPoints.isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              Award {selectedPoints} Points
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
