import { cookies } from "next/headers";

const TOKEN_AGE = 3600;
const TOKEN_NAME = "auth-token";
const TOKEN_REFRESH_NAME = "auth-refresh-token";

export function getToken(): string | undefined {
    // Retrieve auth token for API requests
    const cookieJar = cookies(); 
    const myAuthToken = cookieJar.get(TOKEN_NAME);
    return myAuthToken?.value;
}

export function getRefreshToken(): string | undefined {
    // Retrieve refresh token for API requests
    const cookieJar = cookies(); 
    const myRefreshToken = cookieJar.get(TOKEN_REFRESH_NAME);
    return myRefreshToken?.value;
}

export async function setToken(authToken: string): Promise<void> {
    // Set auth token during login
    const cookieJar = cookies();
    cookieJar.set({
        name: TOKEN_NAME,
        value: authToken,
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: TOKEN_AGE,
    });
}

export async function setRefreshToken(authRefreshToken: string): Promise<void> {
    // Set refresh token during login
    const cookieJar = cookies(); 
    cookieJar.set({
        name: TOKEN_REFRESH_NAME,
        value: authRefreshToken,
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: TOKEN_AGE,
    });
}

export async function deleteTokens(): Promise<void> {
    // Delete tokens during logout
    const cookieJar = cookies(); 
    cookieJar.delete(TOKEN_REFRESH_NAME);
    cookieJar.delete(TOKEN_NAME);
}