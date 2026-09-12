import { useEffect, useState } from "react";
import type { Order } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyDashboardOrdersData, statusColors } from "../assets/assets";
import Loading from "../components/loading";
import { Calendar, CalendarIcon, ChevronRightIcon, PackageIcon } from "lucide-react";








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
             <div className=" space-y-4">
              {orders.map ((orders) =>(
                <Link  key ={orders._id} to={`/orders/${orders._id}`} className="block max-w-4xl bg-white rounded-2xl p-5 hover:shadow transition-all">
                   {/* orders id date and status */}

                   <div className="flex items-start justify-between mb-3">
                     {/* left */}
                     <div>
                      <p className="text-sm font-semibold text-app-green">Order #{orders._id.slice(-8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="size-3 text-app-text-light"/>
                        <span className="text-xs text-app-text-light">{new Date(orders.createdAt).toLocaleDateString("en-US", {month : "short", day: "numeric", year: "numeric"})}</span>

                      </div>
                     </div>

                     {/* right */}
                     <div className="flex items-center gap-2">
                      <span className={`px-4 py-1 text-xs font-medium rounded-full ${statusColors[orders.status]||"bg-gray-100 text-gray-700" } `}>
                        {orders.status}
                      </span>
                        <ChevronRightIcon className="size-4 text-app-text-light" />
                        
                     </div>

                   </div>

                   {/* items thumbnails */}

                   <div className=" flex items-center gap-2 mb-3">
                    {orders.items.slice(0,4).map((item, i)=>(
                      <img key ={i} src={item.image} alt={item.name}  className="size-12 sm:size-16 rounded-lg object-cover border border-app-border"/>
                    ))}

                    { orders.items.length > 4 && <div className="size-12
                                  sm:size-16 rounded-lg bg-app-cream flex-center text-xs
                                  font-semibold text-app-text-light">
                      +{orders.items.length - 4 }
                    </div>

                    }

                   </div>


                   {/* total items & price */}

                   <div className="flex justify-between items-center pt-3 text-sm">

                    <span className="text-app-text-light">{orders.items.length} items</span>
                    <span className="font-semibold text-app-green">{orders.total.toFixed(2)}{currency}</span>

                   </div>

                </Link>
              ))}
               

             </div>
          )}

        

      </div>

    </div>
  )
}

export default MyOrders



 