"use client";

import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFlashcardStore, Flashcard } from "@/lib/store/flashcard-store";
import { FlashcardForm } from "./flashcard-form";

interface FlashcardListProps {
  projectId: string;
}

export function FlashcardList({ projectId }: FlashcardListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const deleteFlashcard = useFlashcardStore((state) => state.deleteFlashcard);

  // Get all flashcards from the store
  const allFlashcards = useFlashcardStore((state) => state.flashcards);

  // Use useMemo to filter flashcards by projectId
  const flashcards = useMemo(() => {
    return allFlashcards.filter((card) => card.projectId === projectId);
  }, [allFlashcards, projectId]);

  const handleDelete = (id: string) => {
    deleteFlashcard(id);
    toast.success("Flashcard deleted successfully!");
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="grid gap-4">
          {flashcards.map((flashcard: Flashcard) => (
            <Card key={flashcard.id}>
              <CardHeader className="relative pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleDelete(flashcard.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardTitle className="pr-8">{flashcard.heading}</CardTitle>
                <CardDescription>
                  Created {new Date(flashcard.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{flashcard.information}</p>
              </CardContent>
            </Card>
          ))}
          {flashcards.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No flashcards yet. Create one to get started!
            </div>
          )}
        </div>
      </ScrollArea>

      <FlashcardForm
        projectId={projectId}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
