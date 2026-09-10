import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { useEffect, useState } from "react";
import { dummyProducts } from "../assets/assets";
import Loading from "../components/loading";
import { ArrowLeftIcon, HomeIcon, LeafIcon, Star, StarIcon } from "lucide-react";


const ProductPage = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "Birr";
  const {id} = useParams()
  const navigate = useNavigate()
  const {items , addToCart,updateQuantity ,removeFromCart} = useCart()

  const [product, setproduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [localQuantity, setLocalQuantity] = useState(1)


  useEffect(() => {
    setLoading(true)
    setLocalQuantity(1)
    window.scrollTo(0, 0)
    const productInCart = dummyProducts.find((p) => p._id === id);
    setproduct(productInCart!)
    setRelatedProducts(dummyProducts.filter((p) => p._id !== id));
    setLoading(false)
  },[id , navigate])

  if(loading) return <Loading/> 
  if(!product) return  null;


  const cartItem = items.find((item) => item.product._id === product._id);
  const incart = !! cartItem;
  const displayQuantity = incart ? cartItem!.quantity : localQuantity;

  const categoryLabel = product.category.replace(/-/g, ' ');




  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product details content would go here */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <HomeIcon className="size-4" />
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-app-green transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-app-green transition-colors capitalize">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
        {/* back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors mb-6"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Back</span>
        </button>
         {/* product details section */}
         <div className="bg-white/50 rounded-2xl overflow-hidden">
         <div className="grid md:grid-cols-2 gap-0">
           {/* left side - image */}
           <div className="relative flex-center p-8 md:p-12 min-h-[320px] md:min-h-[480px]">
              <img src={product.image} alt={product.name} className="max-h-[360px] w-auto object-contain" />
           
           {/* badges */}
            <div className="absolute top-5 left-5 flex flex-wrap gap-1.5">
              {product.isOrganic && (
                <span className=" flex items-center px-2.5 py-1 text-xs font-semibold bg-app-green text-white rounded-full">
                  <LeafIcon className="w-3 h-3" />
                  Organic
                </span>
              )}
              {product.discount > 0 && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-app-orange text-white rounded-full">
                  {product.discount}% OFF
                </span>
              )}

            </div>
         </div>
         {/* right side - details */}
         <div className=" p-6 md:p-10 flex flex-col justify-center ">
           <span className="text-xs text-app-text-light mb-2 capitalize tracking-wider">{categoryLabel}</span>
           <h1 className="text-2xl md:text-3xl font-semibold mb-3 text-app-green">{product.name}</h1>
           {/* <p className="text-base text-app-text-light mb-6">{product.description}</p> */}
            {/* rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5"> 
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`}
                  />
                ))}
                <span className="text-sm font-medium text-app-text">{product.rating}</span>
                <span className="text-sm text-app-text-light">({product.reviewCount} reviews)</span>
              </div>
              </div>
            )}
         </div>

         
         </div>
        </div>


         {/* customer reviews section */}


         {/* related products section */}

      </div>

    </div>
  )
}

export default ProductPage