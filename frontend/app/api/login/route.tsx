"use server"
import { DJANGO_API_ENDPOINT } from '@/config/defaults'
import { setRefreshToken, setToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import ApiProxy from '../proxy';

const DJANGO_API_LOGIN_URL = `${DJANGO_API_ENDPOINT}/token/pair`

interface LoginRequest {
    username: string
    password: string
}

interface LoginResponse {
    username: string
    access: string
    refresh: string
}

export async function POST(request: Request): Promise<Response> {
    const requestData: LoginRequest = await request.json()
    const { data, status } = await ApiProxy.post(DJANGO_API_LOGIN_URL, requestData, false)
    
    if (status === 200) {
        console.log("logged in")
        const { username, access, refresh } = data
        await setToken(access)
        await setRefreshToken(refresh)
        return NextResponse.json({ loggedIn: true, username, access}, { status: 200 })
    }

    const responseData = { message: "Login failed" }
    return NextResponse.json({ loggedIn: false, ...responseData }, { status: 400 })
}