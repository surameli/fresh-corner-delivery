

const FilterPanel = ({categories, category , minPrice, maxPrice, updateFilters, clearFilters, hasFilters}: any) => {
    const categoriesWithAll = [{ name: "All Categories", slug: "" }, ...categories];
  return (
    <div className=" space-y-6">
        {/* categories */}

        <div>
            <h3 className="text-sm font-semibold text-app-green mb-3">Categories</h3>
            <div className="space-y-1.5">
                {categoriesWithAll.map((cat: any) => (
                    <button key={cat.slug} onClick={() => updateFilters("category", cat.slug)} className={`block text-sm text-left px-3 py-2 rounded-md transition-all ${category === cat.slug ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-cream"}`}>
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>

      {/* price range */}
        <div>
            <h3 className="text-sm font-semibold text-app-green mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
                <input type="number" placeholder="Max" value={minPrice || ""} onChange={(e) => updateFilters("minprice", e.target.value)} className="w-full text-sm text-app-text-light placeholder:text-app-text-light/50 px-3 py-2 rounded-lg border bg-white  not-focus:border-app-border"/>
                <span className="text-app-text-light">-</span>
                <input type="number" placeholder="Min" value={maxPrice || ""} onChange={(e) => updateFilters("maxprice", e.target.value)} className="w-full text-sm text-app-text-light placeholder:text-app-text-light/50 px-3 py-2 rounded-lg border bg-white  not-focus:border-app-border"/>
            </div>
        </div>
        {hasFilters && (
        <button onClick={clearFilters} className="w-full text-sm text-app-error font-medium  py-2 rounded-lg  hover:bg-red-50 transition-colors">
            Clear All Filters
        </button>
        )}
    </div>
  )
}

export default FilterPanel
