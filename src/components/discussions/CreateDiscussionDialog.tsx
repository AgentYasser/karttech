import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { useCreateDiscussion } from "@/hooks/useDiscussions";
import { useBooks } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";
import { useAwardPoints } from "@/hooks/usePoints";

interface CreateDiscussionDialogProps {
  children: React.ReactNode;
}

export function CreateDiscussionDialog({ children }: CreateDiscussionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bookId, setBookId] = useState("");
  const [discussionType, setDiscussionType] = useState<"solo" | "group" | "communal">("communal");

  const createDiscussion = useCreateDiscussion();
  const { data: books } = useBooks();
  const { toast } = useToast();
  const awardPoints = useAwardPoints();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !bookId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDiscussion.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        bookId: bookId,
        discussionType: discussionType,
      });

      // Award points for creating a discussion
      awardPoints.mutate({ source: "discussion_created" });

      toast({
        title: "Discussion created!",
        description: "Your discussion has been posted successfully.",
      });

      setOpen(false);
      setTitle("");
      setContent("");
      setBookId("");
      setDiscussionType("communal");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create discussion",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-reading">Start a Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book">Book *</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Discussion Type</Label>
            <Select value={discussionType} onValueChange={(v) => setDiscussionType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo (Personal thoughts)</SelectItem>
                <SelectItem value="group">Group (For reading groups)</SelectItem>
                <SelectItem value="communal">Communal (Open to everyone)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Thoughts *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={4}
            />
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
              disabled={createDiscussion.isPending}
              className="flex-1"
            >
              {createDiscussion.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Discussion"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
