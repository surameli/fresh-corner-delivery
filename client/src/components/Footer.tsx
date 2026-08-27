import { BikeIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { footerData } from "../assets/assets"


const Footer = () => {
  return (
    <footer className="bg-app-green text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* --top-- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* brand */}
                <div >
                    <Link to ='/' className="flex items-center gap-2 mb-4 ">
                    <BikeIcon className="size-6 text-white"/>
                    <span className="text-xl font-semibold">{footerData.brand.name}</span>

                    
                    </Link>

                </div>

            </div>
            {/* bottom */}
            <div>

            </div>
        </div>


    </footer>
  )
}

export default Footer