import { useState } from "react";
import { Book, Trash2, Loader2, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useUserVocabulary, useDeleteVocabulary, useUpdateMastery } from "@/hooks/useVocabulary";
import { cn } from "@/lib/utils";

const Vocabulary = () => {
  const [search, setSearch] = useState("");
  const { data: words, isLoading } = useUserVocabulary();
  const deleteWord = useDeleteVocabulary();
  const updateMastery = useUpdateMastery();

  const filteredWords = words?.filter((word) =>
    word.word.toLowerCase().includes(search.toLowerCase()) ||
    word.definition?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleMasteryClick = (wordId: string, currentLevel: number) => {
    const newLevel = currentLevel >= 5 ? 0 : currentLevel + 1;
    updateMastery.mutate({ id: wordId, masteryLevel: newLevel });
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-reading text-2xl font-semibold text-card-foreground">
            My Vocabulary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {words?.length || 0} words learned
          </p>
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
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "No words match your search" : "No words in your vocabulary yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tap on words while reading to look them up and save them!
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
                      <button
                        onClick={() => handleMasteryClick(word.id, word.mastery_level)}
                        className="w-full"
                      >
                        <Progress value={(word.mastery_level / 5) * 100} className="h-2 cursor-pointer" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to update mastery level
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => deleteWord.mutate(word.id)}
                    disabled={deleteWord.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Vocabulary;
