import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { NextResponse } from "next/server";
import { Message } from "@/model/User.model";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, content } = await request.json();
        const user = await UserModel.findOne({ username });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }
    
        if (!user.isAcceptingMessages) {
            return NextResponse.json({
                success: false,
                message: "User is not accepting messages"
            }, { status: 403 })
        }
        const newMessage = {
            content: content,
            createdAt: new Date()
        }
        user.messages.push(newMessage as Message);
        await user.save();
        return NextResponse.json({
            success: true,
            message: "Message sent successfully"
        }, { status: 200 })
    } catch (error) {
        console.error("Error sending message", error);
        return NextResponse.json({
            success: false,
            message: "Error sending message"
        }, { status: 500 })
    }
}