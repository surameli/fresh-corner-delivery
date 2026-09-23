import express from "express"
import { createProduct, deleteProduct, getFlashDeals, getProducts, updateProduct } from "../controller/productController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";


const  productRouter =  express.Router();

productRouter.get("/flash-deals", getFlashDeals)
productRouter.get("/", getProducts)
productRouter.get("/:id", getProducts)
productRouter.post("/", auth, admin, createProduct)
productRouter.put("/:id", auth, admin, updateProduct)
productRouter.delete("/", auth, admin, deleteProduct)


export default productRouter;