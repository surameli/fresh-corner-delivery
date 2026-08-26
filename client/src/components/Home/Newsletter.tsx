import { MailIcon } from "lucide-react"


const Newsletter = () => {
  return (
    <section className="bg-white py-18 px-4 sm:px-6 lg:px-8 rounded-3xl mx-auto shadow-xs mt-32 mb-20">
        <div className="max-w-2xl mx-auto text-center">
            <div className="size-16 bg-white rounded-xl flex-center mx-auto mb-6 shadow">
                <MailIcon className="size-8 text-app-green" strokeWidth={1.5}/>
            </div>

        </div>
    </section>
  )
}

export default Newsletter