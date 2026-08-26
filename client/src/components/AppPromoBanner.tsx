import { appPromoBannerData } from "../assets/assets"


const AppPromoBanner = () => {
  return (
    <section className="max-w-7xlmx-auto px-4 sm:px-6 lg:px-8 py-20 my-14 bg-green-950 rounded-2xl">
      {/* left side content */}
     <div className="flex flex-col md:flex-row litems-center justify-between gap-8 xl:px-10 ">
        <div className="text-center md:text-left">
          <h2>{appPromoBannerData.title}</h2>
          <p>{appPromoBannerData.description}</p>
           <div>
             <button>App Store</button>
             <button>Google Play</button>
          </div>

        </div>

     </div>
       {/* right side content */}
    </section>
  )
}

export default AppPromoBanner