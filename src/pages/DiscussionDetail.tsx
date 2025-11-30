import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ThumbsUp, User, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const DiscussionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  const { data: discussion, isLoading } = useQuery({
    queryKey: ["discussion", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          book:books(title, author),
          profile:profiles!discussions_user_id_fkey(username, avatar_url)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: messages } = useQuery({
    queryKey: ["discussion_messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussion_messages")
        .select(`
          *,
          profile:profiles!discussion_messages_user_id_fkey(username, avatar_url)
        `)
        .eq("discussion_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("discussion_messages").insert({
        discussion_id: id,
        user_id: user.id,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["discussion_messages", id] });
      toast.success("Message sent!");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!discussion) {
    return (
      <MainLayout>
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground">Discussion not found</p>
          <Link to="/discussions">
            <Button variant="soft" className="mt-4">
              Back to Discussions
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <Link to="/discussions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </Link>

        {/* Discussion */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-soft mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{discussion.profile?.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <h1 className="font-reading text-xl font-semibold text-card-foreground mb-2">
            {discussion.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {discussion.book?.title} by {discussion.book?.author}
          </p>
          <p className="text-card-foreground leading-relaxed">{discussion.content}</p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {discussion.upvotes} upvotes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {messages?.length || 0} replies
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          <h2 className="font-medium text-card-foreground">Replies</h2>
          {messages?.map((message) => (
            <div key={message.id} className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-card-foreground">
                      {message.profile?.username}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground mt-1">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {(!messages || messages.length === 0) && (
            <p className="text-center text-muted-foreground py-6">
              No replies yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Reply Form */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <Textarea
            placeholder="Write a reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="mb-3"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? "Sending..." : "Send Reply"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DiscussionDetail;
