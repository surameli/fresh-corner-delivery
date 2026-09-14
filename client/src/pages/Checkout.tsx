import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyAddressData } from "../assets/assets";
import { useState } from "react";
import type { Address } from "../types";
import { Label } from "@icon-park/react";
import { CheckIcon, CreditCardIcon, MapPinIcon } from "lucide-react";


const Checkout = () => {

const navigate = useNavigate()
const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '$';
const {items, cartTotal} = useCart()
const {user} = {user: {addresses: dummyAddressData}}
const [step, setStep] = useState("address")
const [loading, setLoading] = useState(false)
const [address, setAddress] = useState<Address>({
                   _id: "",
                   label: "Home",
                   address:"",
                  city: "",
                  state: "",
                  zip: "",
                  isDefault: false,
                  lat: 0,
                  lng: 0,
})
   
 const [paymentMethod, setpaymentMethod]  =  useState('card')
 const deliveryFee  = cartTotal > 20 ? 0 : 1.99;
 const tax = cartTotal* 0.08;
 const total = cartTotal + deliveryFee + tax;

 const steps : { key: string; label: string;icon: typeof MapPinIcon }[] = [
  {key: "address", label: "Address" , icon: MapPinIcon},
  {key: "payment", label: "payment" , icon: CreditCardIcon},
  {key: "review", label: "Review" , icon: CheckIcon},
 ]
  const handlePlaceorder = async () =>{
    setLoading(true)
    navigate("/orders")
  }


   
  return (
    <div>Checkout</div>
  )
}

export default Checkout