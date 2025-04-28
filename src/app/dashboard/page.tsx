"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string; isAuthenticated: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('user-session')
      if (storedSession) {
        const session = JSON.parse(storedSession)
        if (session.isAuthenticated) {
          setUser(session)
          setLoading(false)
          return
        }
      }
      // If no valid session is found, redirect to sign in
      router.push('/auth/sign-in')
    } catch (error) {
      console.error("Error loading session:", error)
      router.push('/auth/sign-in')
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.name || user?.email}</CardTitle>
            <CardDescription>Your personal dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a protected page that only authenticated users can access.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
            <CardDescription>Recent actions and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recent activity to display.</p>
            <Button className="mt-4 bg-[#C96442] hover:bg-[#C96442]/90">Start a new activity</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full mb-2">Edit Profile</Button>
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 