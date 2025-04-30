import React, { useState } from "react"
import { SquareStack, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Flashcard {
  id: number
  question: string
  answer: string
}

export function FlashcardsTab() {
  const [currentCard, setCurrentCard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [cardsReviewed, setCardsReviewed] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const flashcards: Flashcard[] = [
    {
      id: 1,
      question: "What is the key innovation of the Transformer architecture?",
      answer: "The self-attention mechanism, which allows the model to weigh the importance of different parts of the input sequence dynamically."
    },
    {
      id: 2,
      question: "What are the main components of a Transformer model?",
      answer: "Encoder, Decoder, Multi-head Self-attention, Position-wise Feed-Forward Networks, and Layer Normalization."
    },
    {
      id: 3,
      question: "How does self-attention work in Transformers?",
      answer: "It computes attention scores between all pairs of tokens using Query, Key, and Value matrices, allowing the model to capture relationships between different positions in the sequence."
    }
  ]

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
    setShowAnswer(false)
  }

  const handlePrevious = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setShowAnswer(false)
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1)
    }
    setCardsReviewed((prev) => prev + 1)
    handleNext()
  }

  const resetProgress = () => {
    setCurrentCard(0)
    setShowAnswer(false)
    setCardsReviewed(0)
    setCorrectAnswers(0)
  }

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SquareStack className="h-5 w-5 text-[#C96442]" />
            <h3 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">Flashcards</h3>
          </div>
          <Button variant="outline" size="sm" onClick={resetProgress}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Progress
          </Button>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
            <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">Progress</p>
            <p className="text-2xl font-bold text-[#C96442]">{cardsReviewed}/{flashcards.length}</p>
            <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">cards reviewed</p>
          </div>
          <div className="p-4 rounded-lg bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10">
            <p className="text-sm font-medium text-[#262625] dark:text-[#FAF9F6] mb-2">Mastery</p>
            <p className="text-2xl font-bold text-[#C96442]">
              {cardsReviewed > 0 ? Math.round((correctAnswers / cardsReviewed) * 100) : 0}%
            </p>
            <p className="text-xs text-[#262625]/70 dark:text-[#BFB8AC]">accuracy rate</p>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative">
          <div className="p-6 rounded-lg bg-white dark:bg-[#1A1A1A] shadow-sm border border-[#E3DACC] dark:border-[#BFB8AC]/30 min-h-[200px]">
            <div className="text-center space-y-4">
              <p className="text-lg text-[#262625]/70 dark:text-[#BFB8AC] mb-4">
                {flashcards[currentCard].question}
              </p>
              {showAnswer ? (
                <>
                  <p className="text-sm text-[#262625] dark:text-[#FAF9F6] p-4 bg-[#E3DACC]/20 dark:bg-[#BFB8AC]/10 rounded-lg">
                    {flashcards[currentCard].answer}
                  </p>
                  <div className="flex justify-center gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAnswer(false)}
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Incorrect
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAnswer(true)}
                      className="border-green-500 text-green-500 hover:bg-green-50"
                    >
                      Correct
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#C96442]"
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm pointer-events-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm pointer-events-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 