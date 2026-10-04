import express  from "express";
import {
    forgotPassword,
    login,
    register,
    resetPassword,
    verifyResetOtp,
} from "../controller/authController.js";


const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/verify-reset-otp', verifyResetOtp)
authRouter.post('/reset-password', resetPassword)



export default authRouter
