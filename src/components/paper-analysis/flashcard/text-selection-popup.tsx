"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, SquareStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardForm } from "./flashcard-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    console.log("Setting up selection handlers for PDFs and regular content");

    const handleSelection = (event: MouseEvent) => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text || text.length === 0) {
          updatePopup("none");
          return;
        }

        console.log("Text selected:", text.substring(0, 30));
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

          console.log(`Showing popup at ${top}, ${left}`);
          updatePopup("block", top, left);
        } catch (error) {
          console.error("Error handling selection:", error);
        }
      }, 50);
    };

    // Handle mouseup in document
    document.addEventListener("mouseup", handleSelection);

    // Special handler for PDF text content - use mutation observer to attach listener to PDF text layers
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          const textLayers = document.querySelectorAll(
            ".react-pdf__Page__textContent",
          );
          textLayers.forEach((layer) => {
            console.log("Adding listener to PDF text layer");
            layer.addEventListener(
              "mouseup",
              (e) => {
                console.log("PDF text selection detected");
                e.stopPropagation(); // Prevent double firing
                handleSelection(e as MouseEvent);
              },
              true,
            );
          });
        }
      }
    });

    // Start observing document for PDF layers
    observer.observe(document.body, { childList: true, subtree: true });

    // Directly attach listeners to any existing PDF layers
    const existingTextLayers = document.querySelectorAll(
      ".react-pdf__Page__textContent",
    );
    existingTextLayers.forEach((layer) => {
      layer.addEventListener(
        "mouseup",
        (e) => {
          console.log("PDF text selection from existing layer");
          e.stopPropagation();
          handleSelection(e as MouseEvent);
        },
        true,
      );
    });

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      observer.disconnect();

      // Clean up listeners on text layers
      const textLayers = document.querySelectorAll(
        ".react-pdf__Page__textContent",
      );
      textLayers.forEach((layer) => {
        layer.removeEventListener(
          "mouseup",
          handleSelection as unknown as EventListener,
        );
      });
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
      <div
        ref={popupRef}
        className="fixed z-[1000] bg-transparent rounded-lg"
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
      </div>

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
