import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User
    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 })
    }

    const { messageId, content } = await request.json();

    if (!messageId || !content) {
        return NextResponse.json({
            success: false,
            message: "Message ID and content are required"
        }, { status: 400 })
    }

    try {
        const currentUser = await UserModel.findById(user._id);
        if (!currentUser) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        const message = (currentUser.messages as any).find(
            (m: any) => m._id.toString() === messageId
        );

        if (!message) {
            return NextResponse.json({
                success: false,
                message: "Message not found"
            }, { status: 404 })
        }

        message.reply = content;
        message.repliedAt = new Date();

        await currentUser.save();

        return NextResponse.json({
            success: true,
            message: "Reply sent successfully"
        }, { status: 200 })

    } catch (error) {
        console.error("Error replying to message", error);
        return NextResponse.json({
            success: false,
            message: "Error replying to message"
        }, { status: 500 })
    }
}
