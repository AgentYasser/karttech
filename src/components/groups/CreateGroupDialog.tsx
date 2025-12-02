import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateGroup } from "@/hooks/useGroups";
import { useBooks } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupDialogProps {
  children: React.ReactNode;
}

export function CreateGroupDialog({ children }: CreateGroupDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState("10"); // Default to 10 for better discussions
  const [readingGoal, setReadingGoal] = useState("");

  const createGroup = useCreateGroup();
  const { data: books } = useBooks();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        bookId: bookId || undefined,
        isPrivate: isPrivate,
        maxMembers: parseInt(maxMembers) || 20,
      });

      toast({
        title: "Group created!",
        description: "Your reading group has been created successfully.",
      });

      setOpen(false);
      setName("");
      setDescription("");
      setBookId("");
      setIsPrivate(false);
      setMaxMembers("10");
      setReadingGoal("");

      // Navigate to the new group detail page
      if (group?.id) {
        navigate(`/groups/${group.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-reading text-xl">Create Reading Group</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Start a community around shared reading interests
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Classic Literature Club, Sci-Fi Enthusiasts"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Choose a name that reflects your group's focus
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will your group read together? What discussions do you want to have?"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help others understand what your group is about
            </p>
          </div>

          {/* Currently Reading */}
          <div className="space-y-2">
            <Label htmlFor="book">Currently Reading (Optional)</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger id="book">
                <SelectValue placeholder="Select a book to read together" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No book selected</SelectItem>
                {books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a book for your group to read together
            </p>
          </div>

          {/* Reading Goal */}
          <div className="space-y-2">
            <Label htmlFor="readingGoal">Reading Goal (Optional)</Label>
            <Input
              id="readingGoal"
              value={readingGoal}
              onChange={(e) => setReadingGoal(e.target.value)}
              placeholder="e.g., Read 12 books this year, Finish War and Peace by March"
            />
            <p className="text-xs text-muted-foreground">
              Set a goal to keep your group motivated
            </p>
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Select value={maxMembers} onValueChange={setMaxMembers}>
              <SelectTrigger id="maxMembers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 members (Intimate)</SelectItem>
                <SelectItem value="10">10 members (Recommended)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Smaller groups foster deeper, more meaningful discussions (max 10)
            </p>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="private" className="text-base">Private Group</Label>
              <p className="text-xs text-muted-foreground">
                Only members can see and join this group
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips for a Great Group
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Set a clear reading schedule</li>
              <li>• Encourage active participation</li>
              <li>• Create discussion questions</li>
              <li>• Be welcoming to new members</li>
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
              disabled={createGroup.isPending || !name.trim()}
              className="flex-1"
            >
              {createGroup.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
