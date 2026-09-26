import { Navigate, Outlet } from "react-router-dom"
import { UseAuth } from "../context/AuthContext"
import Loading from "./Loading"


const ProtectedRoute = () => {
  const {user, loading}= UseAuth()

  if (loading) return <Loading />
  if(!user) return <Navigate to = '/login' replace/>
    
  
  return (
    <Outlet/>
  )
}

export default ProtectedRoute