import { appPromoBannerData } from "../assets/assets"


const AppPromoBanner = () => {
  return (
    <section className="max-w-7xlmx-auto px-4 sm:px-6 lg:px-8 py-20 my-14 bg-green-950 rounded-2xl">
      {/* left side content */}
     <div className="flex flex-col md:flex-row litems-center justify-between gap-8 xl:px-10 ">
        <div className="text-center md:text-left">
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">{appPromoBannerData.title}</h2>
          <p className="text-white/70 mb-6 max-w-md">{appPromoBannerData.description}</p>
           <div className="flex flex-wrap gap-3 justify-center md:justify-start">
             <button className="px-6 py-3 bg-white text-green-950 font-semibold rounded-xl hover:bg-orange-100">App Store</button>
             <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">Google Play</button> 
          </div>

        </div>

     </div>
       {/* right side content */}
    </section>
  )
}

export default AppPromoBanner