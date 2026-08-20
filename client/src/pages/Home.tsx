import Features from "../components/Home/Features.tsx"
import Hero from "../components/Home/Hero.tsx"
import HomeCategories from "../components/Home/HomeCategories.tsx"
import PopularProducts from "../components/Home/PopularProducts.tsx"


const Home = () => {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <Hero/>
      <Features/>
      <HomeCategories/>
      <PopularProducts/>
    </div>
  )
}

export default Home