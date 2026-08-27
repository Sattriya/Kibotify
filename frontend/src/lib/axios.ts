import axios from 'axios'

// Menggunakan library axios untuk mempermudah dalam fetching api
const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE == "development" ? "http://localhost:3000/api" : "/api",
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance