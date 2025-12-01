import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AddBookModal({
    open,
    onOpenChange,
    initialData,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { title: string; author: string; reason?: string | null };
    onSuccess?: () => void;
}) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        description: "",
        cover_image_url: "",
        category: "classic",
        content_type: "text",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                title: initialData.title,
                author: initialData.author,
                description: initialData.reason || ""
            }));
        }
    }, [initialData]);

    const createBook = useMutation({
        mutationFn: async (newBook: typeof formData) => {
            const { error } = await supabase.from("books").insert([newBook]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-books"] });
            onOpenChange(false);
            setFormData({
                title: "",
                author: "",
                description: "",
                cover_image_url: "",
                category: "classic",
                content_type: "text",
            });
            toast.success("Book created successfully");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error("Failed to create book: " + error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createBook.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) =>
                                setFormData({ ...formData, author: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover">Cover Image URL</Label>
                        <Input
                            id="cover"
                            value={formData.cover_image_url}
                            onChange={(e) =>
                                setFormData({ ...formData, cover_image_url: e.target.value })
                            }
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={createBook.isPending}>
                        {createBook.isPending ? "Creating..." : "Create Book"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function BookManagement() {
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: books, isLoading } = useQuery({
        queryKey: ["admin-books", search],
        queryFn: async () => {
            let query = supabase
                .from("books")
                .select("*")
                .order("created_at", { ascending: false });

            if (search) {
                query = query.ilike("title", `%${search}%`);
            }

            const { data, error } = await query.limit(50);
            if (error) throw error;
            return data;
        },
    });

    const deleteBook = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("books").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-books"] });
            toast.success("Book deleted successfully");
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search books..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Book
                </Button>

                <AddBookModal
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : books?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    No books found
                                </TableCell>
                            </TableRow>
                        ) : (
                            books?.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">{book.title}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell>{book.category}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this book?")) {
                                                    deleteBook.mutate(book.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
