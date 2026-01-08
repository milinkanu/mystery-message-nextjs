import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {success, z} from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();
    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get("username")
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result) //debugging
        if (!result.success) {
            const usernameError = result.error.format().username?._errors || []
            return NextResponse.json({
                success: false,
                message: usernameError?.length > 0 ? usernameError.join(', '): "Invalid query parameters"
            }, {status: 400})
        }

        const {username} = result.data
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if (existingVerifiedUser) {
            return NextResponse.json({
                success: false,
                message: "Username already exists"
            }, {status: 400})
        }
        return NextResponse.json({
            success: true,
            message: "Username is available"
        }, {status: 200})
    } catch (error) {
        console.error("Error checking username", error);
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        }, {status: 500})
    }
}

