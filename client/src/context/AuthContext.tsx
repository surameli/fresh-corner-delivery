import  { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "../types";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import toast from "react-hot-toast";
interface AuthContectType{
   user: User | null;
   token: string | null;
   loading: boolean;
   login: (email: string, password: string)=> Promise<void>
   register: ( name: string, email: string, password: string)=> Promise<void>
   logout: ()=>void
   updateUser: (userData: Partial<User> ) => void;
}


const AuthContext = createContext<AuthContectType | undefined > (undefined) 
  
 export function AuthProvider({children}: {children: ReactNode}){

    const navigate= useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [token, settoken] = useState<string | null>(null)
    const [loading, setloading] = useState<boolean>(true)

    useEffect(()=>{
        const savedToken = localStorage.getItem("auth_token")
        const savedUser = localStorage.getItem("auth_user")

        if (savedToken && savedUser) {
            settoken(savedToken)
            setUser(JSON.parse(savedUser))
        }

        setloading(false)
    },[])

    const login = async (email:string, password: string) =>{
        try {
            const {data} = await api.post('/auth/login', {email, password})
            setUser(data.user)
            settoken(data.token)
            localStorage.setItem("auth_token", data.token)
            localStorage.setItem("auth_user", JSON.stringify(data.user))
            toast.success("Login Successful")
            navigate('/')
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message)
        }
    }

    const register = async (name: string, email:string, password: string) =>{
        try {
            const {data} = await api.post('/auth/register', { name, email, password})
            setUser(data.user)
            settoken(data.token)
            localStorage.setItem("auth_token", data.token)
            localStorage.setItem("auth_user", JSON.stringify(data.user))
            toast.success("Registration Successful")
            navigate('/')
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message)
        }
    }

    const logout = ()=>{
        setUser(null)
        settoken(null)
        localStorage.removeItem("auth_token" )
        localStorage.removeItem("auth_user")
    }
    const updateUser = (userData: Partial<User>) =>{
        if(user){
           const updated = {...user, ...userData};
           setUser(updated);
           localStorage.setItem('auth_user', JSON.stringify(updated))
    }
    }
      return <AuthContext.Provider value={
       { user, token, loading, login, register, logout, updateUser

       }}>

        {children}
        </AuthContext.Provider>
 }   
export function UseAuth(){
    const context =  useContext(AuthContext)
    if (!context) throw new Error ("useAuth must be used within AuthProvider");
    return context;
        
    
}









export default AuthContext
