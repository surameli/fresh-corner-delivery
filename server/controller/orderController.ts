



import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";



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