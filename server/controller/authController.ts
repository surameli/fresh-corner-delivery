
import { Request, Response } from "express";
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';

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


