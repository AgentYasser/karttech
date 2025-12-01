import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AddBookModal } from "./BookManagement";

type Suggestion = {
    id: string;
    title: string;
    author: string;
    reason: string | null;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    user_id: string;
    profiles: {
        username: string;
    };
};

export function ContentModeration() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
    const [isAddBookOpen, setIsAddBookOpen] = useState(false);

    const { data: suggestions, isLoading } = useQuery({
        queryKey: ["book-suggestions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("book_suggestions")
                .select(`
          *,
          profiles (username)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as Suggestion[];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: string;
            status: "approved" | "rejected";
        }) => {
            const { error } = await supabase
                .from("book_suggestions")
                .update({ status, reviewed_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["book-suggestions"] });
            toast({
                title: "Status updated",
                description: "Suggestion status has been updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update status.",
                variant: "destructive",
            });
        },
    });

    const handleApprove = (suggestion: Suggestion) => {
        setSelectedSuggestion(suggestion);
        setIsAddBookOpen(true);
    };

    const handleReject = (id: string) => {
        updateStatusMutation.mutate({ id, status: "rejected" });
    };

    const handleBookAdded = () => {
        if (selectedSuggestion) {
            updateStatusMutation.mutate({ id: selectedSuggestion.id, status: "approved" });
            setIsAddBookOpen(false);
            setSelectedSuggestion(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Content Moderation</h2>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Book Details</TableHead>
                            <TableHead>Suggested By</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suggestions?.map((suggestion) => (
                            <TableRow key={suggestion.id}>
                                <TableCell>
                                    <div className="font-medium">{suggestion.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {suggestion.author}
                                    </div>
                                </TableCell>
                                <TableCell>{suggestion.profiles?.username || "Unknown"}</TableCell>
                                <TableCell className="max-w-xs truncate" title={suggestion.reason || ""}>
                                    {suggestion.reason || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            suggestion.status === "approved"
                                                ? "default"
                                                : suggestion.status === "rejected"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {suggestion.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {suggestion.status === "pending" && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleApprove(suggestion)}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleReject(suggestion.id)}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {suggestions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No suggestions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Reusing AddBookModal but pre-filling data */}
            {/* Note: We need to modify BookManagement to export AddBookModal or create a wrapper */}
            {/* For now, assuming we can pass initial data if we modify AddBookModal, 
          but since we can't easily modify the props of an existing component without checking it first,
          I'll check BookManagement.tsx content in the next step to see if I can reuse it or need to adapt.
      */}

            <AddBookModal
                open={isAddBookOpen}
                onOpenChange={setIsAddBookOpen}
                initialData={
                    selectedSuggestion
                        ? {
                            title: selectedSuggestion.title,
                            author: selectedSuggestion.author,
                            reason: selectedSuggestion.reason,
                        }
                        : undefined
                }
                onSuccess={handleBookAdded}
            />
        </div>
    );
}
