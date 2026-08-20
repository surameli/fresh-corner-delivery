import { useNavigate } from "react-router-dom";
import type { Product } from "../types"
import { Star } from "lucide-react";

interface props{
    product: Product
}
const ProductCard = ({product}: props) => {
     

    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
     const {addToCart} = {addToCart:(_data: any) =>{}}
     const navigate = useNavigate()
     



  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hoover:shadow-md transition-all duration-300 group animate-fade-in cursor-pointer"
    onClick={()=>navigate(`/products/${product._id}`)}>
        {/* image */}

        <div className="relative aspect-square overflow-hidden">

          <img src={product.image} alt={product.name} className="w-full h-full object-cover p-4 group-hover:P-2 transition-all duration-300"/>
            {/* badges */}
            <div className="absolute top-3 left-3 flex-wrap gap-1.5">
                {product.discount >0 && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-app-orange text-white rounded-full"> {product.discount}% OFF</span>}
             

            </div>
        </div>
       {/* info */}

       <div className="p-3.5 text-zinc-700">

        <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
        {/* rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
                <Star className="size-3 text-app- warning full-app-warning"/>
                <span className="text-xs font-medium text-app-text">{product.rating}</span>
                <span className="text-xs text-app-text-light">({product.reviewCount})</span>

            </div>
          )}
       </div>

    </div>

  )
}

export default ProductCard
