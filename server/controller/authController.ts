
import { Request, Response } from "express";
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import { randomInt } from "node:crypto";
import sendEmail from "../config/nodemailer.js";

const RESET_OTP_TTL_MS = 10 * 60 * 1000;
const RESET_OTP_MAX_ATTEMPTS = 5;
const RESET_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_OTP_MAX_REQUESTS_PER_HOUR = 5;
const RESET_OTP_REQUEST_WINDOW_MS = 60 * 60 * 1000;
const RESET_PASSWORD_MIN_LENGTH = 8;
const GENERIC_RESET_REQUEST_MESSAGE =
    "If the email is registered, a verification code has been sent.";
const INVALID_RESET_OTP_MESSAGE = "Invalid or expired verification code";

const normalizeEmail = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const email = value.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return email;
};

const getRequestBody = (request: Request): Record<string, unknown> => {
    const body: unknown = request.body;
    return body !== null && typeof body === "object"
        ? body as Record<string, unknown>
        : {};
};

// generate token
const generateToke = ( id:string)=>{
    return jwt.sign({id},process.env.JWT_SECRET as string,
        {expiresIn: "30d"}
    )
}

// check if user is admin
const getAdminSatus = (email:string | null| undefined):
boolean =>{
    if (!email) return false; 
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e)=> e.trim().toLowerCase()): [];
    return adminEmails.includes(email.toLowerCase())
        
    
}
//register
//post/api/auth/register
export const register = async( req:Request, res:Response) =>{
     const {name, email , password} = req.body;
     if (!name || !email  || !password) {
        return res.status(400).json({message: "please provide all fields"})
        
     }
     const existingUser = await prisma.user.findUnique({where:{email: email.toLowerCase()}})
     if (existingUser) {
       return res.status(400).json({message: "user already exists with this email"})
        
     }
     const hashedPassword = await bcrypt.hash(password , 10)

     const user = await prisma.user.create({
         data:{name, email: email.toLowerCase(), password: hashedPassword}
     })
     const token = generateToke(user.id)
     const userData: any={...user};
     delete userData.password;
     userData.isAdmin = getAdminSatus(userData.email)

     res.status(201).json({user: userData, token})

}

//login
//post/api/auth/login
export const login = async( req:Request, res:Response) =>{
     const { email , password} = req.body;
     if ( !email  || !password) {
        return res.status(400).json({message: "please provide email and password"})
        
     }
     const user = await prisma.user.findUnique({where:{email: email.toLowerCase()}, include:{addresses: true}})
     if (!user) {
       return res.status(400).json({message: " invalid email or password"})
        
     }
     const isMatch = await bcrypt.compare(password, user.password)
     if (!isMatch) {
         return res.status(400).json({message: " invalid email or password"})
        
        
     }
     const token = generateToke(user.id)
     const userData: any={...user};
     delete userData.password;
     userData.isAdmin = getAdminSatus(userData.email)

     res.json({user: userData, token})

}

export const forgotPassword = async (req: Request, res: Response) => {
    const email = normalizeEmail(getRequestBody(req).email);
    if (!email) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (user) {
        const now = new Date();
        const existingReset = await prisma.passwordReset.findUnique({
            where: { userId: user.id },
        });

        const requestWindowExpired = existingReset
            ? now.getTime() - existingReset.requestWindowStartedAt.getTime() >= RESET_OTP_REQUEST_WINDOW_MS
            : false;
        const cooldownActive = existingReset
            ? now.getTime() - existingReset.lastSentAt.getTime() < RESET_OTP_RESEND_COOLDOWN_MS
            : false;
        const requestLimitReached = existingReset &&
            !requestWindowExpired &&
            existingReset.requestCount >= RESET_OTP_MAX_REQUESTS_PER_HOUR;

        if (!cooldownActive && !requestLimitReached) {
            const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
            const otpHash = await bcrypt.hash(otp, 10);
            const expiresAt = new Date(now.getTime() + RESET_OTP_TTL_MS);
            const requestCount = existingReset && !requestWindowExpired
                ? existingReset.requestCount + 1
                : 1;
            const claim = existingReset
                ? await prisma.passwordReset.updateMany({
                    where: {
                        id: existingReset.id,
                        otpHash: existingReset.otpHash,
                        lastSentAt: existingReset.lastSentAt,
                        requestCount: existingReset.requestCount,
                        requestWindowStartedAt: existingReset.requestWindowStartedAt,
                    },
                    data: {
                        otpHash,
                        expiresAt,
                        attempts: 0,
                        lastSentAt: now,
                        requestCount,
                        ...(requestWindowExpired ? { requestWindowStartedAt: now } : {}),
                        verifiedAt: null,
                    },
                })
                : await prisma.passwordReset.createMany({
                    data: {
                        userId: user.id,
                        otpHash,
                        expiresAt,
                        lastSentAt: now,
                        requestCount,
                        requestWindowStartedAt: now,
                    },
                    skipDuplicates: true,
                });

            if (claim.count === 1) {
                try {
                    const delivery = await sendEmail({
                        to: email,
                        subject: "Your Fresh Corner Delivery password reset code",
                        body: `
                            <p>Fresh Corner Delivery</p>
                            <p>Your password reset verification code is:</p>
                            <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
                            <p>This code expires in 10 minutes.</p>
                            <p>If you did not request this password reset, you can safely ignore this email.</p>
                        `,
                    });
                    if (delivery.accepted.length === 0 || delivery.rejected.length > 0) {
                        console.error("SMTP did not accept password reset email", {
                            acceptedCount: delivery.accepted.length,
                            rejectedCount: delivery.rejected.length,
                        });
                        await prisma.passwordReset.deleteMany({
                            where: { userId: user.id, otpHash },
                        });
                    } else {
                        console.info("Password reset email accepted by SMTP", {
                            messageId: delivery.messageId,
                        });
                    }
                } catch (error) {
                    const details = typeof error === "object" && error !== null
                        ? error as { code?: unknown; command?: unknown; responseCode?: unknown }
                        : {};
                    console.error("Failed to submit password reset email to SMTP", {
                        code: typeof details.code === "string" ? details.code : undefined,
                        command: typeof details.command === "string" ? details.command : undefined,
                        responseCode: typeof details.responseCode === "number" ? details.responseCode : undefined,
                    });
                    await prisma.passwordReset.deleteMany({
                        where: { userId: user.id, otpHash },
                    });
                }
            }
        }
    }

    return res.status(200).json({ message: GENERIC_RESET_REQUEST_MESSAGE });
};

export const verifyResetOtp = async (req: Request, res: Response) => {
    const body = getRequestBody(req);
    const email = normalizeEmail(body.email);
    const otp = body.otp;

    if (!email || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    const reset = user
        ? await prisma.passwordReset.findUnique({ where: { userId: user.id } })
        : null;
    const now = new Date();

    if (
        !reset ||
        reset.expiresAt <= now ||
        reset.attempts >= RESET_OTP_MAX_ATTEMPTS ||
        !(await bcrypt.compare(otp, reset.otpHash))
    ) {
        if (reset && reset.expiresAt > now && reset.attempts < RESET_OTP_MAX_ATTEMPTS) {
            await prisma.passwordReset.updateMany({
                where: {
                    id: reset.id,
                    otpHash: reset.otpHash,
                    attempts: { lt: RESET_OTP_MAX_ATTEMPTS },
                },
                data: { attempts: { increment: 1 } },
            });
        }
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    const verified = await prisma.passwordReset.updateMany({
        where: {
            id: reset.id,
            otpHash: reset.otpHash,
            expiresAt: { gt: now },
            attempts: { lt: RESET_OTP_MAX_ATTEMPTS },
        },
        data: { verifiedAt: now },
    });
    if (verified.count !== 1) {
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    return res.json({ message: "Verification code verified." });
};

export const resetPassword = async (req: Request, res: Response) => {
    const body = getRequestBody(req);
    const email = normalizeEmail(body.email);
    const otp = body.otp;
    const newPassword = body.newPassword;

    if (typeof newPassword !== "string" || newPassword.length < RESET_PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            message: `Password must be at least ${RESET_PASSWORD_MIN_LENGTH} characters long.`,
        });
    }
    if (Buffer.byteLength(newPassword, "utf8") > 72) {
        return res.status(400).json({ message: "Password is too long." });
    }
    if (!email || typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    const reset = user
        ? await prisma.passwordReset.findUnique({ where: { userId: user.id } })
        : null;
    const now = new Date();

    if (
        !user ||
        !reset ||
        !reset.verifiedAt ||
        reset.expiresAt <= now ||
        reset.attempts >= RESET_OTP_MAX_ATTEMPTS ||
        !(await bcrypt.compare(otp, reset.otpHash))
    ) {
        if (reset && reset.expiresAt > now && reset.attempts < RESET_OTP_MAX_ATTEMPTS) {
            await prisma.passwordReset.updateMany({
                where: {
                    id: reset.id,
                    otpHash: reset.otpHash,
                    attempts: { lt: RESET_OTP_MAX_ATTEMPTS },
                },
                data: { attempts: { increment: 1 } },
            });
        }
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const resetCompleted = await prisma.$transaction(async (transaction) => {
        const consumed = await transaction.passwordReset.deleteMany({
            where: {
                id: reset.id,
                otpHash: reset.otpHash,
                expiresAt: { gt: now },
                verifiedAt: { not: null },
                attempts: { lt: RESET_OTP_MAX_ATTEMPTS },
            },
        });
        if (consumed.count !== 1) return false;

        await transaction.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return true;
    });

    if (!resetCompleted) {
        return res.status(400).json({ message: INVALID_RESET_OTP_MESSAGE });
    }

    return res.json({ message: "Password reset successfully" });
};
