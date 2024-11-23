import { getAuthToken } from "@/lib/auth"
import { isTokenExpired } from "@/components/CheckToken"
import { refreshAuthToken } from "@/components/RefreshToken"

interface FetchResponse {
    data: any
    status: number
}

async function getValidAuthToken(): Promise<string | null> {
    const token = await getAuthToken();
    if (!token) {
        return null;
    }
    if (isTokenExpired(token)) {
        return await refreshAuthToken();
    }
    return token;
}

export default class ApiProxy {

    static async getHeaders(requireAuth: boolean): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        if (requireAuth) {
            console.log("im hereeeeeee!!!!!!!!")
            const authToken = await getValidAuthToken()
            console.log("under")
            if (!authToken){
                return { redirectToLogin: "true" };
            }
            headers["Authorization"] = `Bearer ${authToken}`
        }
        return headers
    }

    static async handleFetch(endpoint: string, requestOptions: RequestInit): Promise<FetchResponse> {
        let data: any = {}
        let status = 500

        try {
            const response = await fetch(endpoint, requestOptions)
            data = await response.json()
            status = response.status
        } catch (error) {
            data = { message: "Cannot reach API server", error }
            status = 500
        }

        return { data, status }
    }

    static async put(endpoint: string, object: any, requireAuth: boolean): Promise<FetchResponse> {
        const jsonData = JSON.stringify(object)
        const headers = await ApiProxy.getHeaders(requireAuth)
        const requestOptions: RequestInit = {
            method: "PUT",
            headers, // shorthand for headers: headers
            body: jsonData
        }
        return await ApiProxy.handleFetch(endpoint, requestOptions)
    }

    static async delete(endpoint: string, requireAuth: boolean): Promise<FetchResponse> {
        const headers = await ApiProxy.getHeaders(requireAuth)
        const requestOptions: RequestInit = {
            method: "DELETE",
            headers
        }
        return await ApiProxy.handleFetch(endpoint, requestOptions)
    }


    // new proxy
    static async post(endpoint: string, object: any, requireAuth: boolean): Promise<FetchResponse> {
        const isFormData = object instanceof FormData;
        const headers = await ApiProxy.getHeaders(requireAuth);
        
        // Remove Content-Type header if object is FormData
        if (isFormData) {
            delete headers["Content-Type"];
        } else {
            object = JSON.stringify(object);
        }
        
        const requestOptions: RequestInit = {
            method: "POST",
            headers,
            body: object,
        };
    
        return await ApiProxy.handleFetch(endpoint, requestOptions);
    }
    

    static async get(endpoint: string, requireAuth: boolean): Promise<FetchResponse> {
        const headers = await ApiProxy.getHeaders(requireAuth)
        const requestOptions: RequestInit = {
            method: "GET",
            headers
        }
        return await ApiProxy.handleFetch(endpoint, requestOptions)
    }
}