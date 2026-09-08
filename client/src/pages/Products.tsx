import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";


const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalpages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const organic = searchParams.get("organic") || "";
  const sort = searchParams.get("sort")  || "";
  const page = Number(searchParams.get("page")) || 1;
  const minprice = searchParams.get("minprice") || "";
  const maxprice = searchParams.get("maxprice") || "";


  const fetchProducts = async () => {
    setLoading(true);
    setProducts(dummyProducts.filter((p) => p.category === category  || p.category === ""));
    setLoading(false);
  };

  useEffect(()=>{
    fetchProducts()
  },[category, organic, sort, page, minprice, maxprice])

  return (
    <div>Products</div>
  )
}

export default Products