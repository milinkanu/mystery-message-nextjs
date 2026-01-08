import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username); //zarurat nhi thi
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return NextResponse.json({
                success: true,
                message: "Verification successful"
            }, { status: 200 })
        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message: "Verification code expired"
            }, { status: 400 })
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid verification code"
            }, { status: 400 })
        }
    } catch (error) {
        console.error("Error verifying code", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying code"
        }, { status: 500 })
    }
}

