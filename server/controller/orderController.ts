



import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { timeStamp } from "node:console";



// create order

// post /api/orders
export const createOrder =  async (req: Request, res: Response)=>{
 const {items , shippingAddress , paymentMethod}= req.body;

 // check if order items are empity

  if (!items || items.length === 0) {
    return res.status(400).json({message: " No order items"})
    
  }
  // Look up actual prices from the database

  const productId = items.map((i : any)=> i.product);
   const products = await prisma.product.findMany({where:{id:{in: productId}}})
    const productMap: Record<string, (typeof products)[0]> = {}
     products.forEach((p: any)=>(productMap[p.id = p]))

     // check if product is in stock


     for(const item of items){
        const product = productMap[item.product]
        if (!product || (product.stock ?? 0)< item.quantity) {
            return res.status(404).json({message: "Product out of stock"});
        }
     }
     const OrderItems =  items.map((item: any)=>{
       const dbproduct = productMap[item.product];
       if(!dbproduct) throw new Error (`product ${item.Product} not found`)
        return {
           product: dbproduct.id,
           name: dbproduct.name,
           image: dbproduct.image,
           price: dbproduct.price,
           quantity: item.quantity,
           unit: dbproduct.unit,


         
       }

     })
     const subtotal = OrderItems.reduce((sum: number, item: any)=>sum + items.price * item.quantity, 0)
     const deliveryFee = subtotal > 20 ? 0 : 1.99;
     const  tax = Math.round(subtotal * 0.08 * 100)/100;
     const total = Math.round((subtotal + deliveryFee + tax)* 100)/100;

     const order = await prisma.order.create({
        data : {
            userId: req.user!.id,
            items: OrderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            deliveryFee,
            tax,
            total,
            statusHistory: [{status: "placed" , note: " order placed successfully", timestamp: new Date()}]
        }
     })

     if (paymentMethod === "card") {
        //payment link
     }

     res.json({order})
     // decrease stock

     for (const item of OrderItems){
        await prisma.product.update({
            where: {id: items.product},
            data: {stock: {decrement: item.quantity}}
        })
     }


}

// get user's  order
// get /api/orders


export const getUserOrders =  async (req: Request, res: Response)=>{
   const {status} = req.query;
    const where: any ={
        userId: req.user!.id,
        NOT: [{paymentMethod: "card", ispaid: false}]
    }
    if (status && status !== "all") {
        where.status = status;

    }
    const orders = await prisma.order.findMany({
        where,
        include: {deliveryPartner: {select:{name: true , phone: true}}},
        orderBy: {createdAt: "desc"}
    })
    res.json({orders})
}
// get single order
//get /api/orders/id

export const getorder =  async (req: Request, res: Response)=>{
   const order = await prisma.order.findFirst({
    where : {id: req.params.id as string , userId: req.user!.id},
    include : {deliveryPartner: {select: {name: true, phone: true, avatar: true, vehicleType: true}}}
   })
   if (!order) {
    return res.status(404).json({ message: " order not found"});
   }
   res.json({order})
}

// update order stsus(admin)

//put /api/orders/:id/status


export const updateorderstatus =  async (req: Request, res: Response)=>{
   const {status, note} = req.body;
   const order = await prisma.order.findUnique({where: {id: req.params.id as string}})

   if(!order){
    return res.status(404).json({message: " order not found"});
   }

   const history = (Array.isArray(order.statusHistory)? order.statusHistory : []) as any[]
    history.push({status, note: note || `order${status.toLowercase()}`,timeStamp: new Date()})
   
    const updateorder = await prisma.order.update({
        where:{id: req.params.id as string},
        data: {status, statusHistory: history}
    })
    res.json({order: updateorder})
}

// get all(admin)
//put /api/orders/all

export const getAllorders =  async (req: Request, res: Response)=>{
   
    const orders = await prisma.order.findMany({
        where: {NOT: [{paymentMethod: "card", isPaid: false}]},
        include: {
            user: {select: {name: true, email:true}},
            deliveryPartner: {select:{name: true , phone: true, email: true}}
        },
        orderBy: {createdAt: "desc"}
    })
    res.json({orders})
}


//get order location
// get /api/orders/:id/location

export const getorderlocation =  async (req: Request, res: Response)=>{
   const order  = await prisma.order.findFirst({
       where : {id: req.params.id as string, userId: req.user!.id},
       select: {liveLocation: true, status: true}

   }
   
   )
   if (!order) return res.status(404).json({message: " order not found"})
    res.json({liveLocation: order.liveLocation , status: order.status})
    
   
}