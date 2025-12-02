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
import { Plus, Search, Trash2, Edit, Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useImportBookContent, useImportAllMissingContent, useBooksWithoutContent } from "@/hooks/useBookContentImport";
import { Progress } from "@/components/ui/progress";

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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, bookTitle: "" });
    const queryClient = useQueryClient();
    const importAllContent = useImportAllMissingContent();
    const { data: booksWithoutContent } = useBooksWithoutContent();

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

            const { data, error } = await query.limit(100);
            if (error) throw error;
            if (!data) return [];

            // Check which books have content
            const booksWithStatus = await Promise.all(
                data.map(async (book) => {
                    const { data: chapters } = await supabase
                        .from("chapters")
                        .select("id")
                        .eq("book_id", book.id)
                        .limit(1);
                    
                    return {
                        ...book,
                        hasContent: (chapters?.length || 0) > 0
                    };
                })
            );
            
            return booksWithStatus;
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

    const handleImportAll = async () => {
        setIsImportModalOpen(true);
        setImportProgress({ current: 0, total: booksWithoutContent?.length || 0, bookTitle: "" });
        
        await importAllContent.mutateAsync((current, total, bookTitle) => {
            setImportProgress({ current, total, bookTitle });
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search books..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex gap-2">
                    {booksWithoutContent && booksWithoutContent.length > 0 && (
                        <>
                            <Button 
                                onClick={handleImportAll}
                                disabled={importAllContent.isPending}
                                variant="default"
                                size="sm"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Import All Content ({booksWithoutContent.length})
                            </Button>
                            <div className="text-xs text-muted-foreground self-center">
                                {booksWithoutContent.length} books need content
                            </div>
                        </>
                    )}
                    <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Book
                    </Button>
                </div>

                <AddBookModal
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                />
            </div>

            {/* Import Progress Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Importing Book Content</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {importProgress.total > 0 && (
                            <>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progress</span>
                                        <span>{importProgress.current} / {importProgress.total}</span>
                                    </div>
                                    <Progress value={(importProgress.current / importProgress.total) * 100} />
                                </div>
                                {importProgress.bookTitle && (
                                    <p className="text-sm text-muted-foreground">
                                        Currently importing: <strong>{importProgress.bookTitle}</strong>
                                    </p>
                                )}
                            </>
                        )}
                        {importAllContent.isPending && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        )}
                        {!importAllContent.isPending && importProgress.current > 0 && (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Import complete!</span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Content Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : books?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No books found
                                </TableCell>
                            </TableRow>
                        ) : (
                            books?.map((book: any) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">{book.title}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell>{book.category}</TableCell>
                                    <TableCell>
                                        {book.hasContent ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <XCircle className="w-4 h-4" />
                                                No Content
                                            </span>
                                        )}
                                    </TableCell>
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
