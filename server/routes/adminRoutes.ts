import  express from 'express'
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { assignDeliveryPartner, createDeliveryPartner, getAdminstats, getDeliveryPartner, updateDeliveryPartner } from '../controller/adminController.js';



const adminRouter = express.Router();

adminRouter.get('/stats' , auth, admin, getAdminstats)
adminRouter.get('/delivery-partners' , auth, admin, getDeliveryPartner)
adminRouter.post('/delivery-partners' , auth, admin, createDeliveryPartner)
adminRouter.put('/delivery-partners/:id' , auth, admin, updateDeliveryPartner)
adminRouter.put('/orders/:id/assign' , auth, admin, assignDeliveryPartner)


export default adminRouter;