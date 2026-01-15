import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({
            success: false,
            message: "Username is required"
        }, { status: 400 })
    }

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        // Filter messages that have a reply and are NOT private (no senderId)
        // We cast to any because TS might complain about types if not fully defined in lean/document context
        const repliedMessages = user.messages.filter((m: any) => m.reply && !m.senderId);

        // Sort by repliedAt descending (newest replies first)
        repliedMessages.sort((a: any, b: any) => {
            return new Date(b.repliedAt).getTime() - new Date(a.repliedAt).getTime();
        });

        return NextResponse.json({
            success: true,
            messages: repliedMessages
        }, { status: 200 })

    } catch (error) {
        console.error("Error fetching public messages", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching messages"
        }, { status: 500 })
    }
}
