import { XIcon } from 'lucide-react'


const AddressForm = ({resetForm, handleSubmit, form, setform, editingId}: any) => {
  return (
    <>
      {/* overlay */}

      <div  className='fixed inset-0 bg-black/40 z-50'/>

      <div onClick={resetForm} className='fixed inset-0 z-50 flex-center p-4'>
        <form onClick={e=> e.stopPropagation()} onSubmit={handleSubmit } className='bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in'>
            {/* form header */}

            <div className='flex items-center justify-between mb-5'>
                <h2 className='text-lg font-semibold text-app-green'>{editingId?"edit Address" : "Add New Address"}</h2>
                <button type="button" onClick={resetForm} className='p-2 hover:bg-app-cream rounded-lg'>
                    <XIcon className='size-5' />
                </button>
            </div>
            {/* form input filds */}

        </form>

      </div>
    </>
  )
}

export default AddressForm
