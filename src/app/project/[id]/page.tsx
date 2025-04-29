"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useQuery, useMutation } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth-store"

// Zod schemas for type safety
const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  isUser: z.boolean(),
  timestamp: z.date(),
})

const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(MessageSchema),
})

type Message = z.infer<typeof MessageSchema>
type Chat = z.infer<typeof ChatSchema>

// Mock API functions
const fetchChat = async (id: string): Promise<Chat> => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return {
    id,
    title: getChatTitle(id),
    messages: [
      {
        id: "1",
        content: "Hello! How can I help you with your research today?",
        isUser: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        id: "2",
        content: "I need help understanding the recent advances in quantum computing.",
        isUser: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "3",
        content: "Quantum computing has seen significant advances in the last few years. The most notable developments include improvements in quantum error correction, increased qubit coherence times, and new applications in fields like cryptography and drug discovery. Would you like me to elaborate on any of these areas?",
        isUser: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      }
    ]
  }
}

const sendMessage = async (chatId: string, content: string): Promise<Message> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Mock response
  return {
    id: Date.now().toString(),
    content: "Thank you for your message. I'm analyzing your query and will provide a comprehensive response shortly. In the meantime, is there anything specific about your topic you'd like me to focus on?",
    isUser: false,
    timestamp: new Date(),
  }
}

// Helper function to get chat title based on ID
function getChatTitle(id: string): string {
  const titles: Record<string, string> = {
    "1": "AI-Powered Form Builder Names",
    "2": "Personalized Driving Instruction for All Levels",
    "3": "Estimating IQ from Conversation",
    "4": "AI Agent to Implement ArXiv Papers and Explain in Blog Posts",
    "5": "Scrabble-Style Word Game",
    "6": "Resolving Celery Import Errors in Python",
  }
  
  return titles[id] || `Chat ${id}`
}

export default function ProjectChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const id = params.id as string
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Fetch chat data
  const { data: chat, isLoading, isError } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => fetchChat(id),
  })
  
  // Send message mutation
  const mutation = useMutation({
    mutationFn: (content: string) => sendMessage(id, content),
    onSuccess: (newMessage) => {
      // In a real app, you would update the chat data in the cache
      // Here we're just clearing the input
      setMessage("")
      
      // Scroll to bottom on new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.")
    }
  })
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return
    
    // Add optimistic update (would be handled by React Query in a real app)
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: message,
      isUser: true, 
      timestamp: new Date(),
    }
    
    // Send the message
    mutation.mutate(message)
  }
  
  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // Adjust textarea height as content changes
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`
    }
  }, [message])
  
  // Scroll to bottom on initial load
  useEffect(() => {
    if (chat && !isLoading) {
      messagesEndRef.current?.scrollIntoView()
    }
  }, [chat, isLoading])
  
  // Handle navigation back to chat list
  const handleBack = () => {
    router.push("/chats")
  }
  
  // Get user's initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (isError || !chat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Error loading chat</p>
        <Button onClick={handleBack} variant="outline">
          Back to Chats
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#FAF9F6] dark:bg-[#262625]">
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2 text-[#262625] dark:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-lg font-medium text-[#262625] dark:text-[#FAF9F6]">{chat.title}</h1>
      </header>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex items-start gap-3 max-w-3xl",
              msg.isUser ? "ml-auto" : ""
            )}
          >
            {!msg.isUser && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-[#C96442] text-[#FAF9F6] text-xs">
                  REM
                </AvatarFallback>
              </Avatar>
            )}
            
            <Card className={cn(
              "p-3 shadow-sm",
              msg.isUser 
                ? "bg-[#C96442] text-[#FAF9F6]" 
                : "bg-[#E3DACC]/30 dark:bg-[#BFB8AC]/10 text-[#262625] dark:text-[#FAF9F6]"
            )}>
              <CardContent className="p-0">
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className={cn(
                  "mt-1 text-xs",
                  msg.isUser ? "text-[#FAF9F6]/70" : "text-[#262625]/50 dark:text-[#FAF9F6]/50"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </CardContent>
            </Card>
            
            {msg.isUser && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-[#262625] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#262625] text-xs">
                  {user?.name ? getInitials(user.name) : user?.email ? getInitials(user.email.split('@')[0]) : "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-[#E3DACC] dark:border-[#BFB8AC]/30">
        <div className="relative flex items-end max-w-3xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="min-h-[40px] max-h-[200px] pr-12 border-[#E3DACC] dark:border-[#BFB8AC]/30 focus:ring-[#C96442] bg-transparent text-[#262625] dark:text-[#FAF9F6] resize-none"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-[#BFB8AC] hover:text-[#262625] dark:hover:text-[#FAF9F6] hover:bg-[#E3DACC]/20 dark:hover:bg-[#BFB8AC]/10"
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach</span>
            </Button>
            <Button
              type="button"
              size="icon"
              disabled={!message.trim() || mutation.isPending}
              onClick={handleSendMessage}
              className="h-8 w-8 rounded-full bg-[#C96442] text-[#FAF9F6] hover:bg-[#C96442]/90 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 border-2 border-[#FAF9F6] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 