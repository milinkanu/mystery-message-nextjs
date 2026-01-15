'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import Navbar from '@/components/Navbar';
import { Message } from '@/model/User.model';
import { useSession } from 'next-auth/react';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  if (!messageString) return [];
  return messageString.split(specialChar).filter(Boolean);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams();
  const username = params.username as string;
  const pathname = usePathname();

  const { data: session } = useSession();

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(parseStringMessages(initialMessageString));
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // New state for replied messages
  const [repliedMessages, setRepliedMessages] = useState<Message[]>([]);

  const fetchRepliedMessages = async () => {
    try {
      const response = await axios.get<ApiResponse>(`/api/get-public-messages?username=${username}`);
      setRepliedMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching replies", error);
    }
  }

  useEffect(() => {
    fetchRepliedMessages();
  }, [username]);

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError(null);
    try {
      const response = await axios.post('/api/suggest-messages');
      const text = response.data;
      setSuggestedMessages(parseStringMessages(text));
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error instanceof AxiosError ? error.message : 'Unknown error';
      setSuggestError(errorMessage);
      toast.error('Failed to fetch suggestions', {
        description: errorMessage,
      });
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
        senderId: session?.user?._id
      });

      toast.success(response.data.message || 'Message sent successfully');
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Error', {
        description:
          axiosError.response?.data.message ?? 'Failed to sent message',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto my-8 p-6 bg-background rounded max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Public Profile Link
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-bold mb-4 block">Send Anonymous Message to @{username}</FormLabel>
                  <div className="mb-2 text-sm flex items-center justify-between">
                    <div>
                      {session ? (
                        <span className="text-green-600 font-medium">
                          Logged in as {session.user.username || session.user.email} <span className="text-xs text-gray-400">({session.user._id})</span>. You will receive a private reply!
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Want a private reply? <Link href={`/sign-in?callbackUrl=${encodeURIComponent(pathname || '/')}`} className="underline text-blue-500">Login</Link> to send as a registered user (still anonymous to receiver).
                        </span>
                      )}
                    </div>
                    {session && (
                      <Link href="/dashboard">
                        <Button size="sm" variant="outline">Back to Dashboard</Button>
                      </Link>
                    )}
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Write your anonymous message here"
                      className="resize-none text-lg p-4 h-32 border-2 border-gray-300 focus:border-blue-500 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 transition-all font-sans"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              {isLoading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || !messageContent}>
                  Send It
                </Button>
              )}
            </div>
          </form>
        </Form>

        <div className="space-y-4 my-8">
          <div className="space-y-2">
            <Button
              onClick={fetchSuggestedMessages}
              className="my-4"
              disabled={isSuggestLoading}
            >
              {isSuggestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Suggest Messages'
              )}
            </Button>
            <p>Click on any message below to select it.</p>
          </div>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Messages</h3>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              {suggestError ? (
                <p className="text-red-500">{suggestError}</p>
              ) : (
                suggestedMessages.map((message, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg bg-white dark:bg-white cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                    onClick={() => handleMessageClick(message)}
                  >
                    <p className="text-base font-medium text-gray-800 dark:text-black">{message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Q&A Board */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Q & A Board</h2>
          <div className="space-y-6">
            {repliedMessages.length > 0 ? (
              repliedMessages.map((msg, index) => (
                <Card key={index} className="bg-white dark:bg-zinc-900 shadow-md transform transition duration-300 hover:scale-[1.01]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 italic">
                      "{msg.content}"
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Asked on {new Date(msg.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="pl-4 border-l-4 border-l-blue-500 py-1">
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {msg.reply}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No questions answered yet.</p>
            )}
          </div>
        </div>

        <Separator className="my-6" />
        <div className="text-center">
          <div className="mb-4">Get Your Message Board</div>
          <Link href={'/sign-up'}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
      </div>
    </>
  );
}