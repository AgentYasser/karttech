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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState("20");

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
      await createGroup.mutateAsync({
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
      setMaxMembers("20");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-reading">Create Reading Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Classic Literature Club"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your group about?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book">Currently Reading (Optional)</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Max Members</Label>
            <Select value={maxMembers} onValueChange={setMaxMembers}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 members</SelectItem>
                <SelectItem value="20">20 members</SelectItem>
                <SelectItem value="50">50 members</SelectItem>
                <SelectItem value="100">100 members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="private">Private Group</Label>
              <p className="text-xs text-muted-foreground">
                Only visible to members
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
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
              disabled={createGroup.isPending}
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
