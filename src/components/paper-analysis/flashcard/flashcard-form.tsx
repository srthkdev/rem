"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFlashcardStore } from "@/lib/store/flashcard-store"

const formSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  information: z.string().min(1, "Information is required"),
})

type FormValues = z.infer<typeof formSchema>

interface FlashcardFormProps {
  projectId: string
  open: boolean
  onClose: () => void
  defaultInformation?: string
}

export function FlashcardForm({ projectId, open, onClose, defaultInformation = "" }: FlashcardFormProps) {
  const addFlashcard = useFlashcardStore((state) => state.addFlashcard)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heading: "",
      information: defaultInformation,
    },
  })

  // Update form when defaultInformation changes
  useEffect(() => {
    if (defaultInformation) {
      form.setValue("information", defaultInformation)
    }
  }, [defaultInformation, form])

  const onSubmit = (data: FormValues) => {
    try {
      addFlashcard(projectId, data.heading, data.information)
      toast.success("Flashcard created successfully!")
      form.reset()
      onClose()
    } catch (error) {
      toast.error("Failed to create flashcard")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Flashcard</DialogTitle>
          <DialogDescription>
            Add a new flashcard to your project. Fill in the heading and information below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="heading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter flashcard heading..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="information"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter flashcard information..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Flashcard</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 