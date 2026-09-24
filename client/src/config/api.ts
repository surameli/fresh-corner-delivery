
import axios from "axios";



const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})

// inject jwt token from localstorage into every request


api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("auth_token")
    if(token){
        config.headers.Authorization = `Bearer${token}`
    }
    return config
})

//handle auth errorrs glovally

api.interceptors.response.use(
    (response) => response,
    (error)=>{
     if(error.Response?.status === 401){
        localStorage.removeItem("auth_token"),
        localStorage.removeItem("auth_user");
        // only redirect if not alrady on auth pages

        if(!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")){
            window.location.href = "/login"
        }
     }
     return Promise.reject(error)
    }
)
export default api;