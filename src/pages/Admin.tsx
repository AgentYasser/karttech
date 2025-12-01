import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { BookManagement } from "@/components/admin/BookManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { ShieldCheck } from "lucide-react";

export default function Admin() {
    return (
        <MainLayout>
            <div className="container py-8 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage platform content, users, and settings
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="dashboard">Overview</TabsTrigger>
                        <TabsTrigger value="books">Books</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="content">Content Moderation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <AdminDashboard />
                    </TabsContent>

                    <TabsContent value="books">
                        <BookManagement />
                    </TabsContent>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="content">
                        <ContentModeration />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
