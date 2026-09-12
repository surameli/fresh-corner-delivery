import { useEffect, useState } from "react";
import type { Order } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/loading";
import { PackageIcon } from "lucide-react";







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
      setloading(false)
    
  },[activetab])


  return (
    <div className="min-h-screen bg-app-cream mb-20">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-app-green mb-6">
         My orders
        </h1>
        {/* tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab)=>(
            <button key={tab} onClick={()=> setActivetab(tab)}  className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${activetab === tab ? "bg-app-green text-white" : "bg-white text-app-text-light hover:bg-app-cream"}`}>
              {tab === 'all' ? "All Orders" : tab}
            </button>
          ))}

        </div>

        {/* orders list */}
          {loading ? (
            <Loading/>
          ): orders.length === 0 ?(
            <div className="text-center py-16">
              <PackageIcon  className="size-16 text-app-border mx-auto mb-4"/>
              <h2 className="text-lg font-medium text-app-green mb-2">No orders yet</h2>
              <p className="text-sm text-app-text-light mb-4">Start shopping to see your orders here</p>

              <Link to="/products" className="inline-flex px-4 py-2 bg-app-green text-white text-sm rounded-lg">
              Start Shopping
              </Link>

            </div>
          ):(
             <div></div>
          )}

        

      </div>

    </div>
  )
}

export default MyOrders