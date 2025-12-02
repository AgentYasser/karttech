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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-reading text-xl">Start a Discussion</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Share your thoughts, ask questions, or spark a conversation about literature
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="book">Book *</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select the book you're discussing" />
              </SelectTrigger>
              <SelectContent>
                {books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the book your discussion relates to
            </p>
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
            <p className="text-xs text-muted-foreground">
              Solo: Personal reflection • Group: Reading group discussion • Communal: Open to all
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Character Development in Chapter 5, Themes of Love and Loss, What did you think of the ending?"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Write a clear, engaging title that captures your discussion topic
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Thoughts *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your insights, questions, or observations. What stood out to you? What made you think? What would you like to explore with others?"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific and thoughtful to encourage meaningful responses
            </p>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💬 Tips for Great Discussions
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Ask open-ended questions to encourage dialogue</li>
              <li>• Reference specific chapters, quotes, or scenes</li>
              <li>• Share your perspective but invite others' views</li>
              <li>• Be respectful and open to different interpretations</li>
              <li>• Engage with responses to keep the conversation going</li>
            </ul>
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
