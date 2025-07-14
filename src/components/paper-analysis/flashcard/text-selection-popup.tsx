"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, SquareStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardForm } from "./flashcard-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom";

interface TextSelectionPopupProps {
  projectId: string;
  setActiveTab?: (
    tab: "analysis" | "podcast" | "visualization" | "flashcards" | "chat",
  ) => void;
}

export function TextSelectionPopup({
  projectId,
  setActiveTab,
}: TextSelectionPopupProps) {
  const [selectedText, setSelectedText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    display: "none",
    top: "0px",
    left: "0px",
  });

  // Use refs to track popup state without re-renders
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedTextRef = useRef("");
  const router = useRouter();

  // Create a stable function for updating popup
  const updatePopup = useCallback(
    (display: string, top: string = "0px", left: string = "0px") => {
      if (!popupRef.current) return;

      popupRef.current.style.display = display;
      popupRef.current.style.top = top;
      popupRef.current.style.left = left;

      // Update state for React as well
      setPopupStyle({ display, top, left });
    },
    [],
  );

  // Handle text selection everywhere, with special focus on PDFs
  useEffect(() => {
    const handleSelectionChange = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text || text.length === 0) {
          updatePopup("none");
          return;
        }

        // Don't show popup if selection is inside an input, textarea, or contenteditable
        if (selection && selection.anchorNode) {
          let node: Node | null = selection.anchorNode;
          while (node) {
            if (
              node instanceof HTMLElement &&
              (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.isContentEditable)
            ) {
              updatePopup("none");
              return;
            }
            node = node.parentNode;
          }
        }

        selectedTextRef.current = text;
        setSelectedText(text);

        // Get selection bounds
        try {
          const range = selection?.getRangeAt(0);
          if (!range) return;

          const rect = range.getBoundingClientRect();

          // Position the popup close to selection
          const left = `${window.scrollX + rect.left + rect.width / 2 - 70}px`;
          const top = `${window.scrollY + rect.bottom + 10}px`;

          updatePopup("block", top, left);
        } catch (error) {
          console.error("Error handling selection:", error);
        }
      }, 50);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updatePopup]);

  const handleCreateFlashcard = () => {
    // Use the ref for most current value
    const text = selectedTextRef.current;
    if (text.trim()) {
      setIsFormOpen(true);
      updatePopup("none");
      toast.success("Text added to flashcard");
    } else {
      toast.error("No text selected");
    }
  };

  const handleAddToAIChat = () => {
    const text = selectedTextRef.current;
    if (text.trim()) {
      localStorage.setItem("ai-chat-draft", text);
      updatePopup("none");
      if (setActiveTab) setActiveTab("chat");
    }
  };

  return (
    <>
      {typeof window !== "undefined" && ReactDOM.createPortal(
        <div
          ref={popupRef}
          className="fixed z-[10000] bg-transparent rounded-lg"
          style={popupStyle}
        >
          <div className="flex flex-col gap-2 p-2">
            <Button
              size="sm"
              variant="default"
              className="flex items-center gap-2 bg-[#C96442] hover:bg-[#C96442]/90"
              onClick={handleCreateFlashcard}
            >
              <SquareStack className="h-4 w-4" />
              Add to Flashcards
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex items-center gap-2 bg-[#C96442] hover:bg-[#C96442]/90"
              onClick={handleAddToAIChat}
            >
              <MessageSquare className="h-4 w-4" />
              Add to AI Chat
            </Button>
          </div>
        </div>,
        document.body
      )}

      <FlashcardForm
        projectId={projectId}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedText("");
        }}
        defaultInformation={selectedText}
      />
    </>
  );
}
