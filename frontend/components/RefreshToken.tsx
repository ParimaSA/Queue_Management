import axios from "axios";
import { getRefreshToken, setRefreshToken, setToken } from "@/lib/auth";

const api = axios.create();

export async function refreshAuthToken(): Promise<string | null> {
    const refreshToken = await getRefreshToken();
    try {
        const response = await axios.post("/auth/refresh", { refreshToken });
        const { accessToken, newRefreshToken } = response.data;
  
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        
        return accessToken;
    } catch (error) {
        return null;
    }
}
