

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

      
    </div>
  )
}

export default FilterPanel
