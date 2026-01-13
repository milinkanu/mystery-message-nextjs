import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: 'User already exists'
            }, {
                status: 400
            });
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        console.log("Generated Verification Code:", verifyCode);
        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: 'User already exists'
                }, {
                    status: 400
                });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserVerifiedByEmail.password = hashedPassword
                existingUserVerifiedByEmail.verifyCode = verifyCode
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000)
                await existingUserVerifiedByEmail.save()
            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            });

            await newUser.save()
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success) {
            return Response.json({
                success: true,
                message: "User registered successfully. Please verify your email address." + "Code: " + verifyCode
            }, {
                status: 201
            });
        }

        return Response.json({
            success: true,
            message: 'User registered successfully. Please verify your email address.'
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return Response.json({
            success: false,
            message: 'Error registering user'
        }, {
            status: 500
        });
    }
}
