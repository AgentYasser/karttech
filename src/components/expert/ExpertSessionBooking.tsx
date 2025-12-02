import { useState } from "react";
import { Clock, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpertSessionBookingProps {
  expertId: string;
  expertName: string;
}

export const ExpertSessionBooking = ({ expertId, expertName }: ExpertSessionBookingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [duration, setDuration] = useState(30); // minutes
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Calculate pricing
  const freeMinutes = 5;
  const ratePerMinute = 2; // $2 per minute after free minutes
  
  const calculateCost = () => {
    if (duration <= freeMinutes) {
      return 0;
    }
    const additionalMinutes = duration - freeMinutes;
    return additionalMinutes * ratePerMinute;
  };

  const totalCost = calculateCost();

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session",
        variant: "destructive",
      });
      return;
    }

    if (!sessionStartTime) {
      toast({
        title: "Time Required",
        description: "Please select a date and time for your session",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      // In a real implementation, you would create the session record
      // and handle payment processing here
      const { data, error } = await supabase
        .from("expert_sessions")
        .insert({
          expert_id: expertId,
          user_id: user.id,
          duration_minutes: duration,
          start_time: sessionStartTime,
          cost: totalCost,
          status: "scheduled"
        })
        .select()
        .single();

      if (error) throw error;

      // Handle payment if cost > 0
      if (totalCost > 0) {
        // In production, integrate with payment gateway (PayPal, Stripe, etc.)
        toast({
          title: "Session Booked!",
          description: `Your session with ${expertName} is scheduled. Payment of $${totalCost.toFixed(2)} will be processed.`,
        });
      } else {
        toast({
          title: "Session Booked!",
          description: `Your free session with ${expertName} is scheduled.`,
        });
      }

      // Reset form
      setDuration(30);
      setSessionStartTime("");
    } catch (error: any) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Book Session with {expertName}</h2>
        <p className="text-gray-600">Schedule a one-on-one expert consultation</p>
      </div>

      {/* Pricing Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-blue-600 mt-1 shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Pricing Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>First 5 minutes are FREE</strong></li>
              <li>• Additional minutes: <strong>$2 per minute</strong></li>
              <li>• Minimum session: 15 minutes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="duration">Session Duration (minutes)</Label>
          <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startTime">Preferred Date & Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={sessionStartTime}
            onChange={(e) => setSessionStartTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold mb-3">Cost Breakdown</h4>
          
          <div className="flex justify-between text-sm">
            <span>Session Duration:</span>
            <span className="font-medium">{duration} minutes</span>
          </div>
          
          <div className="flex justify-between text-sm text-green-600">
            <span>Free Minutes:</span>
            <span className="font-medium">-{Math.min(duration, freeMinutes)} minutes</span>
          </div>
          
          {duration > freeMinutes && (
            <div className="flex justify-between text-sm">
              <span>Additional Minutes ({duration - freeMinutes} × ${ratePerMinute}):</span>
              <span className="font-medium">${(duration - freeMinutes) * ratePerMinute}.00</span>
            </div>
          )}
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Cost:</span>
              <span className={totalCost === 0 ? 'text-green-600' : ''}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
            {totalCost === 0 && (
              <p className="text-sm text-green-600 mt-1">✓ Session is completely free!</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleBookSession}
          disabled={!sessionStartTime || duration < 15 || isBooking}
          className="w-full"
        >
          {isBooking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : totalCost === 0 ? (
            "Book Free Session"
          ) : (
            `Book Session - $${totalCost.toFixed(2)}`
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You can cancel or reschedule up to 24 hours before the session
        </p>
      </div>
    </div>
  );
};

