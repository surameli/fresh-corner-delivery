

import express from "express";
import { cancelDelivery, completeDelivery, getDeliveryDetails, getMyDeliveries, loginPartner, updateDeliveryStatus, updateLocation } from "../controller/deliveryPaertnerController.js";
import {
    forgotDeliveryPartnerPassword,
    resetDeliveryPartnerPassword,
    verifyDeliveryPartnerResetOtp,
} from "../controller/deliveryPasswordResetController.js";
import deliveryAuth from "../middleware/deliveryAuth.js";

const deliveryPartnerRouter  = express.Router()

deliveryPartnerRouter.post('/login', loginPartner)
deliveryPartnerRouter.post('/forgot-password', forgotDeliveryPartnerPassword)
deliveryPartnerRouter.post('/verify-reset-otp', verifyDeliveryPartnerResetOtp)
deliveryPartnerRouter.post('/reset-password', resetDeliveryPartnerPassword)
deliveryPartnerRouter.get('/my-deliveries', deliveryAuth, getMyDeliveries)
deliveryPartnerRouter.get('/my-deliveries/:id', deliveryAuth,
getDeliveryDetails)
deliveryPartnerRouter.put('/my-deliveries/:id/complete', deliveryAuth,
completeDelivery)
deliveryPartnerRouter.put('/my-deliveries/:id/cancel', deliveryAuth,
cancelDelivery)
deliveryPartnerRouter.put('/my-deliveries/:id/status', deliveryAuth,
updateDeliveryStatus)
deliveryPartnerRouter.put('/my-deliveries/:id/location', deliveryAuth,
updateLocation)


export default deliveryPartnerRouter