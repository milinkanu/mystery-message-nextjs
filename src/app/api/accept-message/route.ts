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
    
    const userId = user._id;
    const {acceptMessages} = await request.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages},{new: true});
        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "Message acceptance status updated successfully",
            updatedUser
        }, { status: 200 })
    } catch (error) {
        console.error("Error updating message acceptance status", error);
        return NextResponse.json({
            success: false,
            message: "Error updating message acceptance status"
        }, { status: 500 })
    }
}

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
    
    const userId = user._id;
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            message: "User found successfully",
            isAcceptingMessages: user.isAcceptingMessages
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching user", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching user"
        }, { status: 500 })
    }
}

