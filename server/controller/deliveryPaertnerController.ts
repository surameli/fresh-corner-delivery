

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import  bcrypt  from 'bcrypt';
import  jwt  from "jsonwebtoken";
import { timeStamp } from "node:console";


const generateToken = (id: string)=>{
   return jwt.sign({id, role: "delivery"}, process.env.JWT_SECRET as string , {expiresIn: "30d"})
}




// login delivery parntenrt
//post /api/delivery/login
export const loginPartner = async (req:Request, res: Response) =>{
    const {email, password} = req.body;

    if(!email|| !password){
        return res.status(400).json({message: "please provide email and password"});
    }
    const partner = await prisma.deliveryPartner.findUnique({where: {
        email: email.toLowerCase()
    }})   
    if(!partner){
        return res.status(401).json({message: "Invalid email or password"});
    }
    if (!partner.isActive) {
        return res.status(403).json({message: "Your account has been deactivated"});

    }
    const isMatch = await bcrypt.compare(password, partner.password)
    if (!isMatch) {
        return res.status(401).json({message: "Invalid email and password"});
    }

    const token = generateToken(partner.id)
    const {password: _, ...partnerDate} = partner;

    res.json({partner: partnerDate, token})
}

// get assigned deliveries
//get /api/delivert/my-deliveries
export const getMyDeliveries = async (req:Request, res: Response) =>{
  const{status} = req.query;

  const where: any = {deliveryPartnerId: req.partner!.id};

  if(status === "active"){
    where.status = {in: ["Assigned" , "packed" , "out for Delivery"]}
  }else if(status === "completed"){
     where.status = {in: ["delivered" , "cancelled"]}
  }
   const orders = await prisma.order.findMany({
    where,
    include:{user: {select:{name: true, email:true, phone: true}}},
    orderBy: {createdAt: "desc"}
   })
   res.json({orders})
}

//get single delivery
//get /api/delivery/my-deliveries/:id


export const getDeliveryDetails = async (req:Request, res: Response) =>{
   const order = await prisma.order.findFirst({
    where: {id: req.params.id as string , deliveryPartnerId: req.partner!.id},
    include: {user:{select: {name: true, email: true, phone: true}}}
   })

   if (!order) {
     return res.status(404).json({message: "delivery not found"});
   }

   res.json({order})
}

//complete delivery with otp
// put /api/delivery/my-deliveries/:id/complete


export const completeDelivery = async (req:Request, res: Response) =>{
  const{otp} = req.body;
  const order = await prisma.order.findFirst({
    where: {id: req.params.id as string, deliveryPartnerId: req.partner!.id}
  })

  if(!order || order.status === "cancelled" || order.status === "deliverd"){
    return res.status(400).json({message: "invalid request"});
  }
  if(order.deliveryOtp !== otp){
     return res.status(500).json({message: "Invalid OTP"});
  }
  const history = order.statusHistory as any[];
  history.push({status: 'Delivered' , note: "Delivered by partner" , timeStamp: new Date()})

  const updateorder = await prisma.order.update({
    where: {id: order.id},
    data: {status: "Deliverd" , statusHistory: history,deliveryOtp: ""}
  })
  res.json({order: updateorder, message: "Delivery completed successfully"})
}

// cancel delivery
// put  /api/delivery/my-deliveries/:id/cancel


export const cancelDelivery = async (req:Request, res: Response) =>{
   const { reason} = req.body;
   const order = await prisma.order.findFirst({
    where: {id: req.params.id as string  , deliveryPartnerId: req.partner!.id}
   })
   if (order!.status === "Delivered") {
    return res.status(400).json({message: "cannot cancel a delivered order"});
   }
   const history = order!.statusHistory as any[];
  history.push({status: 'cancelled' , note: reason || "" , timeStamp: new Date()})
   
  const updateorder = await prisma.order.update({
    where: {id: order!.id},
    data: {status: "cancelled" , statusHistory: history}
  })
  res.json({order: updateorder, message: "Delivery cancelled"})
}

// update order ststus
//put api/delivery/my-deliveries/:id/status

export const updateDeliveryStatus = async (req:Request, res: Response) =>{
 const {status} = req.body;
 const allowedStatues  = ["Packed", "Out for Delivery"];

 if(!allowedStatues.includes(status)){
     return res.status(400).json({message: "invalid status update"});
     
 }
 const order = await prisma.order.findFirst({
        where:{id: req.params.id as string, deliveryPartnerId: req.partner!.id}
    })

    const history = order!.statusHistory as any[];
  history.push({status,  note: `status update to ${status}` , timeStamp: new Date()})

  const updatedorder = await prisma.order.update({
    where: {id: order!.id},
    data:{status, statusHistory: history}

  })
   res.jsonp({order:updatedorder})
}

// update live location
// put api/delivery/my=deliverie/:id/location

export const updateLocation = async (req:Request, res: Response) =>{
    const {lat, lng} = req.body;
     const order = await prisma.order.findFirst({
    where: {
        id: req.params.id as string,
        deliveryPartnerId: req.partner!.id,
        status: {in: ['Assigned', "Packed", "Out for Delivery"]}
    }
})
await prisma.order.update({
    where: {id: order!.id},
    data: {liveLocation: {lat, lng, updatedAt: new Date()}}
})
 res.json({success: true})
}