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

      // Navigate to the new room
      navigate(`/audio-rooms/${room.id}`);
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
            <Mic className="w-5 h-5" />
            Start Audio Discussion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Discussion"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be discussing?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Book (Optional)</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific book</SelectItem>
                {books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reading Group (Optional)</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
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
          </div>

          <div className="flex gap-2 pt-2">
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
                "Start Discussion"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
