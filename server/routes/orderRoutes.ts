import  express  from 'express';
import auth from '../middleware/auth.js';
import { createOrder, getAllorders, getorder, getorderlocation, getUserOrders, updateorderstatus } from '../controller/orderController.js';
import admin from '../middleware/admin.js';


const orderRouter = express.Router();

orderRouter.post('/', auth , createOrder)
orderRouter.get('/', auth , getUserOrders)
orderRouter.get('/all', auth , admin, getAllorders)
orderRouter.get('/:id', auth , getorder)
orderRouter.put('/:id/status', auth ,admin , updateorderstatus)
orderRouter.put('/:id/location', auth  , getorderlocation)


export default orderRouter;