import { use, useEffect, useState } from "react"
import type { Product } from "../types"
import { dummyProducts } from "../assets/assets"
import { Zap } from "lucide-react"

const FlashDeals = () => {

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProducts(dummyProducts.filter((p: any) => p.stock > 0))
    setTimeout(() => setLoading(false), 1000)
  }, [])

  return (
    <div className="min-h-screen bg-app-cream">

      {/* banner */}
      <div className="bg-linear-to-r from-app-orange to-app-orange-dark text-white py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 text-center">
          <div className="flex-center gap-2 mb-3">
            <Zap className="size-6 fill-white"/>
            <h1 className="text-3xl  font-semibold">Flash Deals</h1>
            <Zap className="size-6 fill-white"/>
          </div>
          <p className=" text-white/80 max-w-md mx-auto">Limited time offers! Grab the best deals on fresh groceries before they run out!</p>

        </div>

      </div>

    </div>
  )
}

export default FlashDeals