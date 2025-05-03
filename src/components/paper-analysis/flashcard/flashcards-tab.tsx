"use client";

import React, { useState } from "react";
import { Plus, SquareStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardForm } from "./flashcard-form";
import { FlashcardList } from "./flashcard-list";

interface FlashcardsTabProps {
  projectId: string;
}

export function FlashcardsTab({ projectId }: FlashcardsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SquareStack className="h-5 w-5 text-[#C96442]" />
            <span className="text-2xl font-3xl text-[#262625] dark:text-[#FAF9F6] font-[family-name:var(--font-instrument-serif)]">
              Flashcards
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Flashcard
          </Button>
        </div>

        {/* Flashcard List */}
        <FlashcardList projectId={projectId} />

        {/* Create Flashcard Form */}
        <FlashcardForm
          projectId={projectId}
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      </div>
    </div>
  );
}
