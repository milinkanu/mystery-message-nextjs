'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from '@ai-sdk/react';
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
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import Navbar from '@/components/Navbar';

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

  // const {
  //   complete,
  //   completion,
  //   isLoading: isSuggestLoading,
  //   error,
  // } = useCompletion({
  //   api: '/api/suggest-messages',
  //   initialCompletion: initialMessageString,
  //   onError: (err) => {
  //     console.error('Error fetching suggestions:', err);
  //     toast.error('Failed to fetch suggestions', {
  //       description: err.message,
  //     });
  //   },
  // });

  // Using standard fetch instead of streaming for better reliability with fallbacks
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(parseStringMessages(initialMessageString));
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError(null);
    try {
      // POST request to our API
      const response = await axios.post('/api/suggest-messages');
      // The API returns a plain text string separated by '||'
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