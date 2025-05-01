"use client";

import React, { useState, useMemo } from "react";
import { Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useChatStore, Message } from "@/lib/store/chat-store";

interface AIChatTabProps {
  projectId: string;
}

export function AIChatTab({ projectId }: AIChatTabProps) {
  const [input, setInput] = useState("");
  const { addMessage } = useChatStore();
  
  // Get messages from the store
  const allMessages = useChatStore(state => state.messages);
  
  // Filter messages for this project
  const messages = useMemo(() => {
    return allMessages.filter(m => m.projectId === projectId);
  }, [allMessages, projectId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to store
    addMessage({
      content: input,
      sender: "user",
      projectId,
    });

    // Add AI response (hardcoded for now)
    addMessage({
      content: "Hello! I am REM AI, your research assistant. I have analyzed your paper and I'm here to help you understand it better. I have access to the full context of your research paper, including its methodology, findings, and implications. How can I assist you today?",
      sender: "ai",
      projectId,
    });

    setInput("");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-[#C96442] text-[#FAF9F6]"
                    : "bg-[#E3DACC]/50 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6]"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 break-words">
                    {message.content}
                  </div>
                  {message.sender === "ai" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-[#262625]/70 dark:text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-transparent"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your paper..."
            className="flex-1 bg-transparent border border-[#E3DACC] dark:border-[#BFB8AC]/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442] text-[#262625] dark:text-[#FAF9F6] placeholder:text-[#262625]/50 dark:placeholder:text-[#BFB8AC]/50"
          />
          <Button 
            type="submit"
            size="icon"
            className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
} 