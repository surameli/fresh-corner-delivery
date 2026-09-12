import { useEffect, useState } from "react";
import { Order } from "../types";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyDashboardOrdersData } from "../assets/assets";







const MyOrders = () => {

  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setloading] = useState(true)
  const [activetab, setActivetab] = useState("all")
  const [searchParams, setSearchParams] = useSearchParams()

  const tabs = ["all", "placed", "out for Delivery", "delivered"]
  const {clearCart} = useCart()

  const fetchOrders = async ()=>{
    setOrders(dummyDashboardOrdersData as any)
    setloading(false)
  }

  useEffect(()=>{
    if (searchParams.get("clearsCart")) {
      clearCart();
      setSearchParams({})
      setTimeout(()=>{
        fetchOrders()
      }, 2000)
      
    }else{
      fetchOrders()
    }
  },[activetab])


  return (
    <div className="min-h-screen bg-app-cream mb-20">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-app-green mb-6">
         My orders
        </h1>
        {/* tabs */}

        

      </div>

    </div>
  )
}

export default MyOrders