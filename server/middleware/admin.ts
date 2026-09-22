
import { NextFunction, Request, Response } from "express";


const admin = async (req:Request, res:Response, next: NextFunction)=>{
    try {
        
         
    } catch (error: any) {
        console.log(error);
         res.status(500).json({message: "admin verification failed", error: error.message})
        
        
    }

}
export default admin;