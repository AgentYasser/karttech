import { useState } from "react";
import { Book, Loader2, Search, Lock, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useUserVocabularySecure, useVocabularyLimit, usePurchaseVocabularyStorage } from "@/hooks/useVocabularySecure";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { guardVocabularyAccess } from "@/lib/subscriptionService";

const Vocabulary = () => {
  const [search, setSearch] = useState("");
  const { user, profile } = useAuth();
  const { data: vocabData, isLoading } = useUserVocabularySecure();
  const { data: limitInfo } = useVocabularyLimit();
  const purchaseStorage = usePurchaseVocabularyStorage();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedIncrements, setSelectedIncrements] = useState(1);

  const isSubscribed = profile?.subscription_tier === 'premium';

  // Check access on mount
  useState(async () => {
    if (user && !isSubscribed) {
      const access = await guardVocabularyAccess(user.id);
      if (!access.allowed) {
        setShowSubscriptionModal(true);
      }
    }
  });

  const words = vocabData?.words || [];
  const wordCount = vocabData?.count || 0;
  const limit = vocabData?.limit || 20;
  const remaining = vocabData?.remaining || 0;
  const canAddMore = vocabData?.canAddMore ?? false;

  const filteredWords = words.filter((word) =>
    word.word.toLowerCase().includes(search.toLowerCase()) ||
    word.definition?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePurchaseStorage = () => {
    purchaseStorage.mutate(selectedIncrements, {
      onSuccess: () => {
        setShowStorageModal(false);
        // In production, this would redirect to Stripe checkout
      }
    });
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-reading text-2xl font-semibold text-card-foreground">
            My Vocabulary
          </h1>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {wordCount} / {limit} words
            </p>
            {!isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Subscribe to Access
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={(wordCount / limit) * 100} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{remaining} slots remaining</span>
              {!canAddMore && (
                <button
                  onClick={() => setShowStorageModal(true)}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Buy More Storage
                </button>
              )}
            </div>
          </div>

          {/* Limit Info */}
          {wordCount >= limit && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Storage limit reached!</strong> Purchase additional storage for $2 per 10 words.
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search your vocabulary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !isSubscribed ? (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Vocabulary access requires a subscription
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for $9.99/month to access your vocabulary list
            </p>
            <Button onClick={() => setShowSubscriptionModal(true)}>
              Subscribe Now
            </Button>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "No words match your search" : "No words in your vocabulary yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Double-click words while reading to save them to your vocabulary!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWords.map((word, index) => (
              <div
                key={word.id}
                className={cn(
                  "bg-card rounded-xl p-4 border border-border shadow-soft animate-fade-up",
                  index === 1 && "animation-delay-100",
                  index === 2 && "animation-delay-200"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground capitalize">
                      {word.word}
                    </h3>
                    {word.definition && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {word.definition}
                      </p>
                    )}
                    
                    {/* Mastery Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Mastery</span>
                        <span>{word.mastery_level}/5</span>
                      </div>
                      <Progress value={(word.mastery_level / 5) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mastery level: {word.mastery_level}/5
                      </p>
                    </div>
                  </div>

                  {/* NO DELETE BUTTON - Immutable storage */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={(plan) => {
          console.log("Subscribing to plan:", plan);
          setShowSubscriptionModal(false);
        }}
        feature="vocabulary access"
      />

      {/* Storage Purchase Modal */}
      <Dialog open={showStorageModal} onOpenChange={setShowStorageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Vocabulary Storage</DialogTitle>
            <DialogDescription>
              You've reached your limit of {limit} words. Purchase additional storage to continue adding words.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of increments (10 words each):
              </label>
              <select
                value={selectedIncrements}
                onChange={(e) => setSelectedIncrements(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} increment{num > 1 ? 's' : ''} ({num * 10} words) - ${(num * 2).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-2xl font-bold">
                  ${(selectedIncrements * 2).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedIncrements * 10} additional words
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStorageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchaseStorage} disabled={purchaseStorage.isPending}>
              {purchaseStorage.isPending ? "Processing..." : `Purchase for $${(selectedIncrements * 2).toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Vocabulary;
