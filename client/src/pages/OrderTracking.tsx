import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import type { Order } from "../types";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/loading";
import { ArrowLeftIcon } from "lucide-react";


const OrderTracking = () => {

  const {id} = useParams();
  const navigate = useNavigate()
  const [order, setorder] = useState<Order |null>(null)
  const [loading, setloading] = useState(true)
  const [livelocation , setLiveLocation] = useState<{lat: number; lng: number} | null> (null)

  useEffect (()=>{
    setorder(dummyDashboardOrdersData.find((o) => o._id === id)as any)
    setloading(false)
  },[id, navigate])

  if(loading) return <Loading/>
  if(!order) null
  return (
    <div className="min-h-screen mn-20 bg-app-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <button onClick={()=> navigate("/orders")}
        className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors">
          <ArrowLeftIcon className="soze-4"/> Back to Orders
        </button>

        {/* oreder id date status */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-app-green"> Order #{order!._id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-app-text-light mt-1">Placed on{new Date(order!.createdAt).toLocaleDateString("en-us" , {month: "long", day: "numeric", year:"numeric"})}</p>
          </div>
          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${order!.status === "Delivered"  ?  "bg-green-100 text-green-700" :order!.status ==="cancelled" ? "bg-red-100 text-red-700" : "bg-app-orange/10 text-app-orange" }`}>
             {order!.status}
          </span>

        </div>

      </div>

    </div>
  )
}

export default OrderTracking