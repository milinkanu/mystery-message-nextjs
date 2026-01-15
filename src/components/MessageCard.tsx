import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button';
import { X, Send, Lock, Globe } from "lucide-react";
import { toast } from "sonner"
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

import { Message } from "@/model/User.model";

type MessagecardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
    onMessageReply?: (messageId: string, reply: string) => void;
}

const Messagecard = ({ message, onMessageDelete, onMessageReply }: MessagecardProps) => {
    const [reply, setReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        toast(response.data.message)
        onMessageDelete(message._id as unknown as string)
    }

    const handleReplySubmit = async () => {
        if (!reply.trim()) return;
        setIsReplying(true);
        try {
            const response = await axios.post<ApiResponse>('/api/reply-message', {
                messageId: message._id,
                content: reply
            });
            toast.success(response.data.message);
            if (onMessageReply) {
                onMessageReply(message._id as unknown as string, reply);
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <Card className="border-t-4 border-t-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-card text-card-foreground flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold break-words pr-4 text-foreground">{message.content}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-8 h-8 p-0 shrink-0"><X className="w-5 h-5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this message.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                    </CardDescription>
                    {message.senderId ? (
                        <div className="flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                            <Lock className="w-3 h-3 mr-1" /> Private Message
                        </div>
                    ) : (
                        <div className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                            <Globe className="w-3 h-3 mr-1" /> Public Message
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grow">
                {message.reply ? (
                    <div className="bg-muted p-4 rounded-lg mt-4 border border-l-4 border-l-green-500">
                        <p className="text-xs font-semibold text-green-600 mb-1">You Replied:</p>
                        <p className="text-sm text-foreground">{message.reply}</p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        <Textarea
                            placeholder="Write a reply..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="text-sm resize-none"
                        />
                        <Button
                            size="sm"
                            onClick={handleReplySubmit}
                            disabled={isReplying || !reply.trim()}
                            className="w-full"
                        >
                            {isReplying ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Reply</>}
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter>

            </CardFooter>
        </Card>
    )
}

export default Messagecard