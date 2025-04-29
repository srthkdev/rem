"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth-store"
import { Header } from "@/components/header"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const checkSession = () => {
      try {
        console.log("Checking session...")
        const storedSession = localStorage.getItem('user-session')
        console.log("Session data:", storedSession ? "Found" : "Not found")
        
        if (storedSession) {
          const session = JSON.parse(storedSession)
          console.log("Parsed session:", session)
          
          if (session && session.isAuthenticated) {
            console.log("Valid authenticated session found")
            // Update auth store with user data
            setUser({
              id: session.id,
              email: session.email,
              name: session.name,
              image: session.image
            })
            setLoading(false)
            return true
          } else {
            console.log("Session exists but not authenticated")
          }
        }
        
        console.log("No valid session found, redirecting to sign in")
        router.push('/auth/sign-in')
        return false
      } catch (error) {
        console.error("Error checking session:", error)
        toast.error("Error loading your session")
        router.push('/auth/sign-in')
        return false
      }
    }

    // Check session immediately
    const hasValidSession = checkSession()
    
    // If no valid session, redirect after a short delay
    if (!hasValidSession) {
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [router, setUser])

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {user?.name || user?.email?.split('@')[0]}</CardTitle>
                <CardDescription>Your personal dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a protected page that only authenticated users can access.</p>
                {user?.image && (
                  <div className="mt-4">
                    <img 
                      src={user.image} 
                      alt={user.name || "Profile"} 
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Recent actions and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p>No recent activity to display.</p>
                <Button 
                  className="mt-4 bg-[#C96442] hover:bg-[#C96442]/90"
                  onClick={() => router.push('/project/new')}
                >
                  Start a new project
                </Button>
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
      </main>
    </div>
  )
} 