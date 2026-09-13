import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import type { Order } from "../types";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/loading";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";


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
        <div className="grid lg:grid-cols-3 gap-6">
          {/*letf site  timeline + map Area */}

          <div className="lg:col-span-2 space-y-6">
            {/* otp card */}
            <OrderOTP order = {order}/>
            {/* live tracking map */}
            <LiveMap order={order} liveLocation={livelocation}/>
            {/* progress timeline */}
            <OrderTimeLine order={order} />

            {/* delivery person */}
            {order?.deliveryPartner && order.status !== "deliverd" && order.status !== "cancelled" && (
              <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-app-green flex-center">
                    <span className="text-white font-semibold text-sm">
                      {order.deliveryPartner.name.charAt(0)}

                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ap-green"> {order.deliveryPartner.name}</p>
                    <p className="text-xs text-app-text-light capitalize">{order.deliveryPartner.vehicleType} • Delivery Partner </p>
                  </div>

                </div>
                <a href={`tel:${order.deliveryPartner.phone}`} className="p-2.5 bg-app-cream rounded-xl hover:bg-app-cream-dark transition-colors">
                  <PhoneIcon className="size-4 text-app-green"/>
                </a>

              </div>
            ) }

          </div>

          {/* right side - orders details sidebars */}
          <div className="space-y-5">
            {/* delivery address */}
            <div className="bg-white rounded-2xl p-5">
              <h3>
                <MapPinIcon className="size-4"/>
                Delivery Address
              </h3>
              <p className="text-sm text-app-text-light leading-relaxed">
                {order?.shippingAddress.label}
                <br />
                {order?.shippingAddress.address}
                <br />
                {order?.shippingAddress.city}, {order?.shippingAddress.state} {order?.shippingAddress.zip}
              </p>

            </div>
              

          </div>



        </div>

      </div>

    </div>
  )
}

export default OrderTracking