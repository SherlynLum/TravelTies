import axios from "axios";
import { useAuth } from "@/context/authContext";

const axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL
});