import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mic } from "lucide-react";
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
import { useCreateDiscussionRoom } from "@/hooks/useDiscussionRooms";
import { useBooks } from "@/hooks/useBooks";
import { useGroups } from "@/hooks/useGroups";

interface CreateRoomDialogProps {
  children: React.ReactNode;
}

export function CreateRoomDialog({ children }: CreateRoomDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [duration, setDuration] = useState("30");

  const createRoom = useCreateDiscussionRoom();
  const { data: books } = useBooks();
  const { data: groups } = useGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      const room = await createRoom.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        bookId: bookId || undefined,
        groupId: groupId || undefined,
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      setBookId("");
      setGroupId("");
      setDuration("30");

      // Navigate to the new room
      navigate(`/audio-rooms/${room.id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-reading text-xl flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Start Audio Discussion
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create a live voice discussion about books
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Discussion Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Discussion, Themes in 1984, Character Analysis"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Choose a clear, engaging topic for your discussion
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be discussing? Share some talking points or questions to guide the conversation."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help participants prepare for the discussion
            </p>
          </div>

          {/* Book Selection */}
          <div className="space-y-2">
            <Label>Related Book (Optional)</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book if relevant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific book</SelectItem>
                {books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link your discussion to a specific book
            </p>
          </div>

          {/* Reading Group */}
          <div className="space-y-2">
            <Label>Reading Group (Optional)</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Open to everyone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Open to everyone</SelectItem>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Limit discussion to a specific reading group
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes (Quick chat)</SelectItem>
                <SelectItem value="30">30 minutes (Standard)</SelectItem>
                <SelectItem value="60">1 hour (Deep dive)</SelectItem>
                <SelectItem value="90">1.5 hours (Extended)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set expectations for discussion length
            </p>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎤 Tips for Great Discussions
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Prepare talking points in advance</li>
              <li>• Encourage everyone to participate</li>
              <li>• Stay on topic but allow natural flow</li>
              <li>• Be respectful of different viewpoints</li>
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
              disabled={createRoom.isPending || !title.trim()}
              className="flex-1"
            >
              {createRoom.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Discussion
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
