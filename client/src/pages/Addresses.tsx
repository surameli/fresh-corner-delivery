import { dummyAddressData } from "../assets/assets"
import type { Address } from "../types"
import { useEffect, useState } from "react"


const Addresses = () => {
  const [addresses , setAddresses] = useState<Address[]>([])
  const  [loading , setloading]  = useState(true)
  const [showForm, setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setform] = useState({label: "", addresses: "", city: "", state: "", zip: "", isDefault: false});

  const resetForm = () =>{
    setform({label: "", addresses: "", city: "", state: "", zip: "", isDefault: false})
    setShowForm(false)
    setEditingId(null)
  }
  const handelsubmit = async (e:React.SubmitEvent)=>{
    e.preventDefault()
  }

  const onEditHandler = (add: Address)=>{
    setform({label: add.label, addresses: add.address, city: add.city, state: add.state, zip: add.zip, isDefault: add.isDefault})
    
    setEditingId(add._id)
    setShowForm(true)

  }

  useEffect(()=>{
     setAddresses(dummyAddressData)
     setTimeout(()=> setloading(false),1000)
  },[])
  return (

    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

      </div>

    </div>
  )
}

export default Addresses