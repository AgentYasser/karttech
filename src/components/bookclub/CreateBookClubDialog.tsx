/**
 * Create Book Club Dialog
 * Per Claude/Anti Gravity specifications
 * Creates live audio discussion rooms with social sharing
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Users, Share2, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDiscussionRoom, useJoinRoom } from "@/hooks/useDiscussionRooms";
import { useBooks } from "@/hooks/useBooks";
import { toast } from "sonner";

interface CreateBookClubDialogProps {
  children: React.ReactNode;
}

export function CreateBookClubDialog({ children }: CreateBookClubDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"create" | "share">("create");
  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("20");

  const createRoom = useCreateDiscussionRoom();
  const joinRoom = useJoinRoom();
  const { data: books } = useBooks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookTitle.trim() || !description.trim()) {
      toast.error("Please fill in book title and description");
      return;
    }

    try {
      // Create the book club discussion room
      const room = await createRoom.mutateAsync({
        title: `${bookTitle} - Book Club Discussion`,
        description: `${description}\n\nBook: ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ""}\nMax Participants: ${maxParticipants}`,
        bookId: undefined, // Can be enhanced later
        groupId: undefined,
        scheduledAt: scheduleDate && scheduleTime ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : undefined,
      });

      // Auto-join the creator/moderator
      await joinRoom.mutateAsync(room.id);

      // Generate shareable link
      const link = `${window.location.origin}/book-club/${room.id}`;
      setShareableLink(link);

      // Move to share step
      setStep("share");
      
      toast.success("Book club created! Share the link to invite members.");

    } catch (error) {
      toast.error("Failed to create book club. Please try again.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Join my book club discussion!\n\n${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ""}\n\n${shareableLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`Join my book club discussion: ${bookTitle}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${text}`, '_blank');
  };

  const copyForInstagram = () => {
    const text = `Join my book club discussion!\n\n📚 ${bookTitle}${bookAuthor ? `\n✍️ by ${bookAuthor}` : ""}\n\nLink: ${shareableLink}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied! Paste in Instagram story or bio");
  };

  const copyForDiscord = () => {
    const text = `📚 **Book Club Discussion**\n\n${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ""}\n${description}\n\nJoin here: ${shareableLink}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied! Paste in Discord");
  };

  const handleDone = () => {
    // Navigate to the club
    const clubId = shareableLink.split("/").pop();
    if (clubId) {
      navigate(`/book-club/${clubId}`);
    }
    
    // Reset and close
    setOpen(false);
    setStep("create");
    setBookTitle("");
    setBookAuthor("");
    setDescription("");
    setScheduleDate("");
    setScheduleTime("");
    setMaxParticipants("20");
    setShareableLink("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "create" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-reading text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                Create Book Club Discussion
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Set up a live audio discussion about any book
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Book Title */}
              <div className="space-y-2">
                <Label htmlFor="bookTitle">Book Title *</Label>
                <Input
                  id="bookTitle"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g., Pride and Prejudice, 1984, The Great Gatsby"
                  className="text-base"
                />
              </div>

              {/* Book Author */}
              <div className="space-y-2">
                <Label htmlFor="bookAuthor">Author Name *</Label>
                <Input
                  id="bookAuthor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g., Jane Austen, George Orwell"
                  className="text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Discussion Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you discuss? Which chapters? What themes?"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Help members know what to expect from this discussion
                </p>
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">Date (Optional)</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Time (Optional)</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-3">
                Leave empty to start immediately
              </p>

              {/* Max Participants */}
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                  <SelectTrigger id="maxParticipants">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 participants (Private)</SelectItem>
                    <SelectItem value="5">5 participants (Small)</SelectItem>
                    <SelectItem value="10">10 participants (Medium)</SelectItem>
                    <SelectItem value="20">20 participants (Large)</SelectItem>
                    <SelectItem value="50">50 participants (Community)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  As moderator, you'll control who can speak and manage the discussion
                </p>
              </div>

              {/* Moderator Privileges Info */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  👑 Your Moderator Privileges
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Control who can speak (mute/unmute)</li>
                  <li>• Assign co-moderator for help</li>
                  <li>• End the discussion when done</li>
                  <li>• Share invitation link</li>
                  <li>• Record the session (optional)</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRoom.isPending || !bookTitle.trim() || !description.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {createRoom.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Create Discussion
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Share Step */
          <>
            <DialogHeader>
              <DialogTitle className="font-reading text-xl flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-600" />
                Book Club Created! 🎉
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Share this link to invite members to your discussion
              </p>
            </DialogHeader>

            <div className="space-y-5">
              {/* Shareable Link */}
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="text-sm bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Social Media Sharing */}
              <div className="space-y-3">
                <Label>Share On</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareToWhatsApp}
                    className="justify-start gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white text-xs">W</div>
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareToTelegram}
                    className="justify-start gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-xs">T</div>
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyForInstagram}
                    className="justify-start gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">I</div>
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyForDiscord}
                    className="justify-start gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-white text-xs">D</div>
                    Discord
                  </Button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Share this link with friends! They'll be able to join your discussion and participate in the live audio conversation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDone}
                  className="flex-1"
                >
                  Done
                </Button>
                <Button
                  onClick={handleDone}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  Go to Discussion
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

