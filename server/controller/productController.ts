

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";



//Get /api/products/flash-deals



export const getFlashDeals =  async(req:Request, res:Response)=>{
    const products = await  prisma.product.findMany({
        where:{stock: {gt: 0}},
        orderBy: {originalPrice:"desc" }
    })
    const productWithDiscount = products.map((p: any)=>{
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price ) / p.originalPrice)* 100) : 0;
       return {...p, discount}
    })

    res.json({products: productWithDiscount.slice(0,8)})
}

// get  /api/products

export const getProducts = async (req: Request, res: Response) =>{
     const {category, search, minPrice, maxPrice, sort} = req.query;
   
     const where: any = {};
     if(category && category !== "all") where.category = category as string;
     if(search) where.name = {contains: search as string, mode: "insensitive"};
     if(minPrice || maxPrice) {
        where.price = {};
        if(minPrice) where.price.gte = Number(minPrice)
        if(maxPrice) where.price.lte = Number(maxPrice)
    }
  const orderBy: any = {};
  if(sort === "price-low") orderBy.price = 'asc'
  else if(sort === "price-high") orderBy.price = 'desc'
  else orderBy.CreatedAt = 'desc'


  const products = await prisma.product.findMany({where, orderBy})

  
     const productWithDiscount = products.map((p: any)=>{
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price ) / p.originalPrice)* 100) : 0;
       return {...p, discount}
    })
   res.json({products: productWithDiscount})
}

// get / api/products/:id
