import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User
    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 })
    }

    try {
        // Find users who have messages sent by the current user
        // We use aggregation to:
        // 1. Match users who have at least one message with senderId == current user's ID
        // 2. Unwind messages to work with individual message objects
        // 3. Match the specific messages that have senderId == current user's ID
        // 4. Project the necessary fields

        const userId = new mongoose.Types.ObjectId(user._id);

        const sentMessages = await UserModel.aggregate([
            {
                $match: {
                    "messages.senderId": userId
                }
            },
            {
                $unwind: "$messages"
            },
            {
                $match: {
                    "messages.senderId": userId
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1, // Receiver's username
                    messageContent: "$messages.content",
                    reply: "$messages.reply",
                    createdAt: "$messages.createdAt",
                    repliedAt: "$messages.repliedAt",
                    isPrivateReply: { $literal: true } // Just a marker
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            messages: sentMessages
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching sent messages", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching sent messages"
        }, { status: 500 })
    }
}
