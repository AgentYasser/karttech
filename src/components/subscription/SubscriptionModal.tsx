import { useState } from "react";
import { X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: "monthly" | "annual") => void;
  feature?: string; // e.g., "Continue Reading", "Join Discussion"
}

export const SubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onSubscribe,
  feature = "this feature" 
}: SubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  const plans = {
    monthly: {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      popular: false,
      priceValue: 9.99
    },
    annual: {
      name: "Annual",
      price: "$99.99",
      period: "per year",
      popular: true,
      savings: "Save 17%",
      priceValue: 99.99,
      monthlyEquivalent: "$8.33/month"
    }
  };

  const handleSubscribe = () => {
    onSubscribe(selectedPlan);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            Unlock Full Access
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Subscribe to continue {feature} and access all premium features
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-6">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key as "monthly" | "annual")}
              className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                selectedPlan === key
                  ? "border-primary bg-primary/5"
                  : plan.popular
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded mb-2 inline-block">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-600 text-sm ml-1">{plan.period}</span>
              </div>
              {plan.monthlyEquivalent && (
                <p className="text-gray-600 text-sm mb-1">{plan.monthlyEquivalent}</p>
              )}
              {plan.savings && (
                <p className="text-green-600 text-sm font-semibold">{plan.savings}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">What you get:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Unlimited book access</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Join unlimited audio discussions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Create and join reading groups</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Ad-free experience</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Access to expert sessions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Vocabulary list access (20 words free, then $2 per 10 words)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Full library access</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleSubscribe}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Subscribe Now - {plans[selectedPlan].price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

