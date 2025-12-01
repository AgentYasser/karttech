import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple GDPR settings page.
 * Allows user to export their data and request account deletion.
 */
export function GDPR() {
    const [exportUrl, setExportUrl] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const exportData = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            toast.error("You must be logged in to export data.");
            return;
        }
        // For demo, we just fetch profile data as JSON.
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id);
        if (error) {
            toast.error("Failed to export data.");
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        setExportUrl(url);
        toast.success("Data ready for download.");
    };

    const deleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        setDeleting(true);
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            toast.error("You must be logged in.");
            setDeleting(false);
            return;
        }
        // Delete profile row
        const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        if (profileError || authError) {
            toast.error("Failed to delete account.");
        } else {
            toast.success("Account deleted.");
            // Sign out
            await supabase.auth.signOut();
        }
        setDeleting(false);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">GDPR Settings</h1>
            <p className="mb-4">You can export your personal data or request account deletion.</p>
            <div className="space-x-4">
                <Button onClick={exportData}>Export My Data</Button>
                {exportUrl && (
                    <a href={exportUrl} download="my-data.json" className="underline">
                        Download Export
                    </a>
                )}
                <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete My Account"}
                </Button>
            </div>
        </div>
    );
}
