import { Mic, MicOff, Crown, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AwardPointsDialog } from "./AwardPointsDialog";
import { RoomParticipant } from "@/hooks/useDiscussionRooms";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  participant: RoomParticipant;
  currentUserId: string | undefined;
  isCurrentUserModerator: boolean;
  roomId: string;
  onToggleMute: (participantId: string, isMuted: boolean) => void;
  onPromote: (participantId: string) => void;
}

export function ParticipantCard({
  participant,
  currentUserId,
  isCurrentUserModerator,
  roomId,
  onToggleMute,
  onPromote,
  moderatorCount = 0,
}: ParticipantCardProps) {
  const isCurrentUser = participant.user_id === currentUserId;
  const canMute = isCurrentUser || isCurrentUserModerator;
  // Only allow promoting one additional moderator (limit to 2 moderators total: creator + 1)
  // Check if we've reached the limit
  const canPromote = isCurrentUserModerator && participant.role === "member" && moderatorCount < 2;
  const canAwardPoints = !isCurrentUser;

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 border border-border shadow-soft",
        participant.is_speaking && "ring-2 ring-primary animate-pulse"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-medium">
            {participant.profiles?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          {participant.role !== "member" && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              {participant.role === "creator" ? (
                <Crown className="w-3 h-3 text-white" />
              ) : (
                <Shield className="w-3 h-3 text-white" />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground truncate">
            {participant.profiles?.username || "Unknown"}
            {isCurrentUser && " (You)"}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {participant.role}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {canAwardPoints && (
            <AwardPointsDialog
              roomId={roomId}
              toUserId={participant.user_id}
              toUsername={participant.profiles?.username || "User"}
            >
              <Button variant="ghost" size="icon" className="text-amber-500">
                <Award className="w-4 h-4" />
              </Button>
            </AwardPointsDialog>
          )}

          {canMute && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleMute(participant.id, !participant.is_muted)}
              className={participant.is_muted ? "text-destructive" : "text-muted-foreground"}
            >
              {participant.is_muted ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}

          {canPromote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPromote(participant.id)}
              className="text-xs"
            >
              Promote
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
