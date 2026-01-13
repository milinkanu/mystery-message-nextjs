import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { username, code } = body;

        console.log("Verify Code API - Payload:", { username, code });

        if (!username || !code) {
            return NextResponse.json({
                success: false,
                message: "Username and code are required"
            }, { status: 400 })
        }

        let decodedUsername = username;
        try {
            decodedUsername = decodeURIComponent(username);
        } catch (e) {
            console.error("Error decoding username:", e);
        }

        console.log("Verify Code API - Decoded Username:", decodedUsername);

        // Case-insensitive find
        // Note: In a real prod app with millions of users, you might want a normalized 'usernameLower' field for efficiency.
        const user = await UserModel.findOne({
            username: { $regex: new RegExp(`^${decodedUsername}$`, 'i') }
        });
        console.log("Verify Code API - User Found:", user ? "Yes" : "No");
        if (user) {
            console.log("Verify Code API - Found User ID:", user._id);
            console.log("Verify Code API - Stored Code:", user.verifyCode);
            console.log("Verify Code API - Expiry:", user.verifyCodeExpiry);
        } else {
            const allUsers = await UserModel.find({}, 'username');
            console.log("Verify Code API - User NOT found. All DB Users:", allUsers.map(u => u.username));
        }

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
                message: "Verification code expired. Please sign up again to get a new code."
            }, { status: 400 })
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid verification code"
            }, { status: 400 })
        }
    } catch (error: any) {
        console.error("Error verifying code (Details):", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying code: " + (error.message || "Unknown error")
        }, { status: 500 })
    }
}
