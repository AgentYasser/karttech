import { useState, useEffect } from "react";
import { BookOpen, Plus, Loader2, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { lookupWord } from "@/hooks/useVocabulary";
import { useAddVocabularySecure } from "@/hooks/useVocabularySecure";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { useAwardPoints } from "@/hooks/usePoints";

interface WordLookupDialogProps {
  word: string;
  bookId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export function WordLookupDialog({ word, bookId, open, onOpenChange }: WordLookupDialogProps) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { mutate: addVocabulary, showSubscriptionModal, setShowSubscriptionModal, showStorageModal, setShowStorageModal } = useAddVocabularySecure();
  const awardPoints = useAwardPoints();

  useEffect(() => {
    if (open && word) {
      setLoading(true);
      setError(null);
      
      lookupWord(word)
        .then((data) => {
          if (data) {
            setDefinition(data);
          } else {
            setError("Word not found in dictionary");
          }
        })
        .catch(() => {
          setError("Failed to look up word");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [word, open]);

  const handleAddToVocabulary = async () => {
    if (!definition) return;
    
    const mainDefinition = definition.meanings[0]?.definitions[0]?.definition || "";
    
    addVocabulary({
      word: definition.word,
      definition: mainDefinition,
      bookId,
    }, {
      onSuccess: (result) => {
        if (result.success) {
          // Award points for learning a new word
          awardPoints.mutate({ source: "vocabulary_learned" });
          onOpenChange(false);
        }
        // If not successful, modal will be shown by the hook
      }
    });
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-reading flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Word Definition
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        )}

        {definition && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold capitalize">{definition.word}</h3>
                {definition.phonetic && (
                  <p className="text-sm text-muted-foreground">{definition.phonetic}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={speakWord}>
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {definition.meanings.map((meaning, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {meaning.partOfSpeech}
                  </span>
                  
                  <ol className="space-y-2">
                    {meaning.definitions.slice(0, 3).map((def, defIdx) => (
                      <li key={defIdx} className="text-sm">
                        <p>{def.definition}</p>
                        {def.example && (
                          <p className="text-muted-foreground italic mt-1">
                            "{def.example}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddToVocabulary}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to My Vocabulary
            </Button>
          </div>
        )}
      </DialogContent>
      
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
      
      {/* Storage Purchase Modal - TODO: Create component */}
    </Dialog>
  );
}
