import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Product } from "../types";
import { categoriesData, dummyProducts } from "../assets/assets";
import { ChevronDown, Home, SlidersHorizontal } from "lucide-react";



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
    setProducts(dummyProducts.filter((p) => p.category === category  || category === ""));
    setLoading(false);
  };
  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if(key !== "page") {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  const activeCategory = categoriesData.find((c) => c.slug === category);
  const hasFilters = category || organic || minprice || maxprice;


  useEffect(()=>{
    fetchProducts()
  },[category, organic, sort, page, minprice, maxprice])

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
         {/* breadcrumb */}
         <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
           <Home className=" size-4" />
          </Link>
          <span >/</span>
          <span className="text-app-green font-medium">{activeCategory ? activeCategory.name : "All Products"}</span>
          
         </nav>

         <div className="flex gap-8 xl:gap-10">
          {/* sidebar- desktop */}

          <aside className="hidden xl:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-4 sticky top-24">
              <p>Filters</p>
              </div>
           </aside>

           {/* main content */}

           <main className="flex-1">
            {/* header */}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-app-green">{activeCategory ? activeCategory.name : "All Products"}</h1>
                <p className="text-sm text-app-text-light mt-0.5">{products.length} products found</p>
              </div>

              <div className="flex flex-col lg:items-center gap-3">
                {/* mobile filter toggle */}
                <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm bg-white rounded-xl border border-app-border hover:bg-app-cream transition-colors">
                  <SlidersHorizontal className="size-4"/> Filter
                </button>

                {/* sort dropdown */}
                <div className="relative">
                <select value={sort} onChange={(e) => updateFilters("sort", e.target.value)} className=" appearance-none pl-3 pr-8 py-2 text-sm rounded-xl bg-white border border-app-border focus:border-app-green outline-none cursor-pointer">
                  <option value="">Newest</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">A → Z</option>
                </select>
                <ChevronDown className=" absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-app-text-light w-3.5 h-3.5"/>
                </div>
             

              </div>

            </div>

           </main>
         </div>

      </div>

    </div>
  )
}

export default Products