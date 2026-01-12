'use client'

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
import { X } from "lucide-react";
import { toast } from "sonner"
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';


import { Message } from "@/model/User.model";

type MessagecardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}

const Messagecard = ({ message, onMessageDelete }: MessagecardProps) => {
    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        toast(response.data.message)
        onMessageDelete(message._id as unknown as string)
    }
    return (
        <Card className="border-t-4 border-t-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-card text-card-foreground">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl font-bold break-words pr-4 text-foreground">{message.content}</CardTitle>
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
                <CardDescription className="text-sm mt-2 font-medium text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}

export default Messagecard