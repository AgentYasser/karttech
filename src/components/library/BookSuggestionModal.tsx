import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const suggestionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    reason: z.string().optional(),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

export function BookSuggestionModal() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SuggestionFormValues>({
        resolver: zodResolver(suggestionSchema),
        defaultValues: {
            title: "",
            author: "",
            reason: "",
        },
    });

    const onSubmit = async (data: SuggestionFormValues) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("book_suggestions").insert({
                user_id: user.id,
                title: data.title,
                author: data.author,
                reason: data.reason,
                status: "pending",
            });

            if (error) throw error;

            toast({
                title: "Suggestion submitted",
                description: "Thanks! We'll review your suggestion shortly.",
            });
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error submitting suggestion:", error);
            toast({
                title: "Error",
                description: "Failed to submit suggestion. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Suggest a Book
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Suggest a Book</DialogTitle>
                    <DialogDescription>
                        Can't find a book you love? Suggest it to the community!
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Book Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. The Great Gatsby" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. F. Scott Fitzgerald" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Why should we add this? (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us why this book is great..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Submit Suggestion
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
