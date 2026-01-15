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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  const { data: session } = useSession()

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => (message._id as unknown as string) !== messageId))
    toast("Message deleted successfully")
  }

  const handleReplyMessage = (messageId: string, newReply: string) => {
    setMessages(messages.map((message) =>
      (message._id as unknown as string) === messageId
        ? { ...message, reply: newReply } as unknown as Message
        : message
    ));
  }

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

  const [sentMessages, setSentMessages] = useState<any[]>([])
  const [isSentLoading, setIsSentLoading] = useState(false)

  const fetchSentMessages = useCallback(async () => {
    setIsSentLoading(true)
    try {
      const response = await axios.get<ApiResponse>("/api/get-sent-messages")
      setSentMessages(response.data.messages || [])
    } catch (error) {
      console.error("Error fetching sent messages", error)
    } finally {
      setIsSentLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !session.user) return
    fetchAcceptMessage()
    fetchMessages()
    fetchSentMessages()


    // Set profile URL safely on client side
    if (typeof window !== 'undefined' && session.user.username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${session.user.username}`);
    }

  }, [session, setValue, fetchAcceptMessage, fetchMessages, fetchSentMessages])

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

      {/* Profile/Settings Cards ... */}
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

      <Tabs defaultValue="received" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="received">Received Messages</TabsTrigger>
            <TabsTrigger value="sent">Sent Private Messages</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
              fetchSentMessages();
            }}
          >
            {isLoading || isSentLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        <TabsContent value="received">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageCard
                  key={message._id as unknown as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                  onMessageReply={handleReplyMessage}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                <p>No messages to display yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sentMessages.length > 0 ? (
              sentMessages.map((msg, index) => (
                <Card key={index} className="flex flex-col border-t-4 border-t-purple-600 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">To: @{msg.username}</CardTitle>
                      <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                        Private Inquiry
                      </div>
                    </div>
                    <CardDescription>Sent: {new Date(msg.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <p className="mb-4 text-base">{msg.messageContent}</p>
                    {msg.reply ? (
                      <div className="bg-muted p-3 rounded-lg border-l-4 border-green-500 mt-auto">
                        <p className="text-xs font-semibold text-green-600 mb-1">Reply Received:</p>
                        <p className="text-sm">{msg.reply}</p>
                        <p className="text-xs text-muted-foreground mt-2 text-right">{new Date(msg.repliedAt).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border-l-4 border-yellow-500 mt-auto">
                        <p className="text-sm text-yellow-600 dark:text-yellow-500 italic flex items-center">
                          Waiting for reply...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                <p>You haven't sent any private messages yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
