import { useState } from "react";
import { Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Expert } from "./ExpertCard";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { useAuth } from "@/contexts/AuthContext";

interface BookingModalProps {
    expert: Expert | null;
    isOpen: boolean;
    onClose: () => void;
    userPoints: number;
}

type SessionType = '7_min' | 'extended';

export function BookingModal({ expert, isOpen, onClose, userPoints }: BookingModalProps) {
    const [sessionType, setSessionType] = useState<SessionType>('7_min');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const { user, profile } = useAuth();

    if (!expert) return null;

    const handleBook = async () => {
        // Check subscription before booking
        if (!user || !profile?.is_subscribed) {
            setShowSubscriptionModal(true);
            return;
        }

        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setStep('success');
    };

    const reset = () => {
        setStep('select');
        setSessionType('7_min');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-[600px]">
                {step === 'success' ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Booking Confirmed!</DialogTitle>
                            <DialogDescription>
                                You're scheduled with {expert.name} for {date ? format(date, 'PPP') : 'today'}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 bg-muted rounded-lg text-sm text-left mx-auto max-w-sm">
                            <p><strong>Session:</strong> {sessionType === '7_min' ? '7-Minute Q&A' : 'Extended Deep Dive'}</p>
                            <p><strong>Time:</strong> 2:00 PM (Mock Time)</p>
                            <p><strong>Link:</strong> Sent to your email</p>
                        </div>
                        <Button onClick={reset} className="w-full max-w-sm">Done</Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Book a Session with {expert.name}</DialogTitle>
                            <DialogDescription>
                                Choose your session type and preferred time.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="7_min">7-Minute Q&A</TabsTrigger>
                                <TabsTrigger value="extended">Extended Session</TabsTrigger>
                            </TabsList>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Left Col: Details */}
                                <div className="space-y-4">
                                    <TabsContent value="7_min" className="mt-0 space-y-4">
                                        <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                                            <div className="flex items-center gap-2 font-semibold text-primary mb-2">
                                                <Clock className="w-4 h-4" />
                                                Quick Chat (7 mins)
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Perfect for a specific question or quick insight.
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Cost:</span>
                                                <span className="font-bold text-primary">500 Points</span>
                                            </div>
                                        </div>
                                        {userPoints < 500 && (
                                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                                                <AlertCircle className="w-3 h-3" />
                                                Insufficient points ({userPoints}/500)
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="extended" className="mt-0 space-y-4">
                                        <div className="p-4 border rounded-lg bg-card">
                                            <div className="flex items-center gap-2 font-semibold mb-2">
                                                <Clock className="w-4 h-4" />
                                                Extended Session
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                In-depth discussion, essay review, or mentorship.
                                            </p>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                                <div className="flex items-start gap-2 text-sm text-blue-800">
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="font-semibold mb-1">Pricing Information</p>
                                                        <ul className="text-xs space-y-1">
                                                            <li>• First 5 minutes are FREE</li>
                                                            <li>• Additional minutes: $2 per minute</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Select duration:</span>
                                                <span className="font-bold text-primary">15-90 minutes</span>
                                            </div>
                                        </div>

                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-2 font-semibold text-sm mb-2">
                                                <CreditCard className="w-4 h-4" />
                                                Payment Method
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-12 bg-background border rounded flex items-center justify-center text-xs font-bold">VISA</div>
                                                <div className="h-8 w-12 bg-background border rounded flex items-center justify-center text-xs font-bold text-muted-foreground">...4242</div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <div className="space-y-2">
                                        <Label>Topic / Question</Label>
                                        <Textarea placeholder="What would you like to discuss?" className="resize-none" rows={3} />
                                    </div>
                                </div>

                                {/* Right Col: Calendar */}
                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center gap-2 font-semibold text-sm mb-2 px-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        Select Date
                                    </div>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border shadow-sm"
                                    />
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {['10:00 AM', '2:00 PM', '4:30 PM'].map(time => (
                                            <Button key={time} variant="outline" size="sm" className="text-xs">
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Tabs>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleBook}
                                disabled={isProcessing || (sessionType === '7_min' && userPoints < 500)}
                                className="min-w-[120px]"
                            >
                                {isProcessing ? "Booking..." : "Confirm Booking"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={(plan) => {
                    console.log("Subscribing to plan:", plan);
                    setShowSubscriptionModal(false);
                    // After subscription, retry booking
                    handleBook();
                }}
                feature="booking expert sessions"
            />
        </Dialog>
    );
}
