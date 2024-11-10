"use server"
import { cookies } from "next/headers";

const TOKEN_AGE = 3600;
const TOKEN_NAME = "auth-token";
const TOKEN_REFRESH_NAME = "auth-refresh-token";

export async function getAuthToken(): Promise<string | undefined> {
    // Retrieve auth token for API requests
    const cookie = await cookies();
    const authToken = cookie.get(TOKEN_NAME);
    return Promise.resolve(authToken?.value);
}


export async function getRefreshToken(): Promise<string | undefined> {
    // Retrieve refresh token for API requests
    const cookie = await cookies()
    const refreshToken = cookie.get(TOKEN_REFRESH_NAME);
    return Promise.resolve(refreshToken?.value);
}


export async function setToken(authToken: string): Promise<void> {
    // Set auth token during login
    const cookie = await cookies()
    cookie.set({
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
    const cookie = await cookies()
    cookie.set({
        name: TOKEN_REFRESH_NAME,
        value: authRefreshToken,
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: TOKEN_AGE,
    });
}


export async function deleteTokens(): Promise<void> {
    const cookie = await cookies();
    cookie.delete(TOKEN_NAME);
    cookie.delete(TOKEN_REFRESH_NAME);
}