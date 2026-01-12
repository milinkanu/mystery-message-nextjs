'use client'

import { useCallback, useEffect, useState } from "react"
import { Message } from "@/model/User.model"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import axios, { AxiosError } from "axios"
import { User } from "next-auth"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCcw, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import MessageCard from "@/components/MessageCard"
import { ApiResponse } from "@/types/ApiResponse"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => (message._id as unknown as string) !== messageId))
    toast("Message deleted successfully")
  }

  const { data: session } = useSession()
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const { register, watch, setValue } = form

  const acceptMessage = watch("acceptMessage")

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/accept-message")
      setValue("acceptMessage", response.data.isAcceptingMessages || false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Something went wrong")
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages")
      setMessages(response.data.messages || [])
      if (refresh) {
        toast("Messages fetched successfully")
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Something went wrong")
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) return
    fetchAcceptMessage()
    fetchMessages()

    // Set profile URL safely on client side
    if (typeof window !== 'undefined' && session.user.username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${session.user.username}`);
    }

  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.post<ApiResponse>("/api/accept-message", { acceptMessage: !acceptMessage })
      setValue("acceptMessage", response.data.isAcceptingMessages || false)
      toast(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "Something went wrong")
    } finally {
      setIsSwitchLoading(false)
    }
  }

  if (!session || !session.user) {
    return <div>Please login</div>
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast('URL Copied!', {
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-auto p-6 w-full max-w-6xl bg-background text-foreground">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Profile Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Unique Link</CardTitle>
            <CardDescription>Share this link to receive anonymous messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input value={profileUrl} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Message Settings</CardTitle>
            <CardDescription>Control whether you want to receive new messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Accept Messages</span>
              <Switch
                checked={acceptMessage}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Messages</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id as unknown as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
            <p>No messages to display yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
