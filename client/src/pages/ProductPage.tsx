import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { useEffect, useState } from "react";
import { dummyProducts } from "../assets/assets";
import Loading from "../components/loading";


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
    setproduct (product!)
    setRelatedProducts(dummyProducts.filter((p) => p._id !== id));
    setLoading(false)
  },[id , navigate])

  if(loading) return <Loading/> 
  if(!product) return  null;


  const cartItem = items.find((item) => item.product._id === product._id);
  const incart = !! cartItem;
  const displayQuantity = incart ? cartItem!.quantity : localQuantity;



  return (
    <div>ProductPage</div>
  )
}

export default ProductPage