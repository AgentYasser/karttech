import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Simple cookie consent banner.
 * Stores consent in localStorage under "cookie_consent".
 * Shows a modal with detailed info when the user clicks "Learn more".
 */
export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            // Show banner after short delay to avoid flash of content
            const timer = setTimeout(() => setVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem("cookie_consent", "true");
        setVisible(false);
        toast.success("Cookie consent accepted");
    };

    const decline = () => {
        localStorage.setItem("cookie_consent", "false");
        setVisible(false);
        toast.info("Cookie consent declined. Some features may be limited.");
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-foreground text-primary p-4 shadow-lg flex items-center justify-between md:justify-start md:space-x-4 z-50">
            <span className="text-sm md:text-base">
                We use cookies to improve your experience. By continuing you agree to our use of cookies.
            </span>
            <div className="flex space-x-2 mt-2 md:mt-0">
                <Button variant="outline" size="sm" onClick={decline}>
                    Decline
                </Button>
                <Button size="sm" onClick={accept}>
                    Accept
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                            Learn more
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cookie Policy</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 text-sm">
                            <p>
                                Our application stores a minimal set of cookies to remember your consent and improve performance. No personal data is shared with third parties.
                            </p>
                            <p className="mt-2">
                                You can manage your preferences in the <a href="/gdpr" className="underline">GDPR settings</a> page.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
