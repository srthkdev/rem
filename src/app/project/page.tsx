"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

// Define chat type with Zod Schema
import { z } from "zod"

const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  lastMessage: z.string(),
  daysAgo: z.number(),
})

type Chat = z.infer<typeof ChatSchema>

// Mock API function - would be replaced with a real API call
const fetchChats = async (): Promise<Chat[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Return mock data
  return [
    { id: "1", title: "AI-Powered Form Builder Names", lastMessage: "Last message", daysAgo: 7 },
    { id: "2", title: "Personalized Driving Instruction for All Levels", lastMessage: "Last message", daysAgo: 11 },
    { id: "3", title: "Estimating IQ from Conversation", lastMessage: "Last message", daysAgo: 12 },
    { id: "4", title: "AI Agent to Implement ArXiv Papers and Explain in Blog Posts", lastMessage: "Last message", daysAgo: 15 },
    { id: "5", title: "Scrabble-Style Word Game", lastMessage: "Last message", daysAgo: 19 },
    { id: "6", title: "Resolving Celery Import Errors in Python", lastMessage: "Last message", daysAgo: 21 },
  ]
}

export default function ChatsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch chats with React Query
  const { data: chats = [], isLoading, isError } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  })
  
  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleNewChat = () => {
    router.push("/project/new")
  }
  
  const handleChatClick = (chatId: string) => {
    router.push(`/project/${chatId}`)
  }
  
  const handleSelectAll = () => {
    toast.info("Select all functionality not implemented yet")
  }

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-8 pt-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-instrument-serif)] text-[#262625] dark:text-[#FAF9F6]">
          Your chat history
        </h1>
        <Button
          onClick={handleNewChat}
          className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6] px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#BFB8AC]" />
        <Input
          type="text"
          placeholder="Search your chats..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#FAF9F6]/5 dark:bg-[#262625]/5 border-[#E3DACC] dark:border-[#BFB8AC]/30 text-[#262625] dark:text-[#FAF9F6] placeholder:text-[#BFB8AC] rounded-md"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#C96442] border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load chats</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </div>
      ) : (
        <>
          {chats.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-sm text-[#BFB8AC] dark:text-[#E3DACC]">
                  You have {chats.length} previous chats with REM
                </p>
                <button 
                  onClick={handleSelectAll}
                  className="text-[#C96442] hover:text-[#C96442]/80 text-sm font-medium focus:outline-none"
                >
                  Select
                </button>
              </div>
              
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <Card 
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className="p-4 cursor-pointer border-[#E3DACC] dark:border-[#BFB8AC]/30 hover:border-[#C96442]/50 transition-colors duration-200 bg-transparent"
                  >
                    <div>
                      <h3 className="font-medium text-[#262625] dark:text-[#FAF9F6]">{chat.title}</h3>
                      <p className="text-sm text-[#BFB8AC] dark:text-[#E3DACC] mt-1">
                        {chat.lastMessage} {chat.daysAgo} days ago
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF9F6]/5 dark:bg-[#262625]/5 rounded-lg border border-dashed border-[#E3DACC] dark:border-[#BFB8AC]/30">
              <h3 className="text-xl font-medium mb-2 text-[#262625] dark:text-[#FAF9F6]">No chats yet</h3>
              <p className="text-[#BFB8AC] dark:text-[#E3DACC] mb-6 max-w-sm mx-auto">
                Start your first conversation with REM to begin exploring research together.
              </p>
              <Button
                onClick={handleNewChat}
                className="bg-[#C96442] hover:bg-[#C96442]/90 text-[#FAF9F6]"
              >
                Start a new chat
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 