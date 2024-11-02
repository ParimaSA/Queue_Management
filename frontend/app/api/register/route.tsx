"use server"
import { DJANGO_API_ENDPOINT } from '@/config/defaults'
import { setRefreshToken, setToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import ApiProxy from '../proxy';

const DJANGO_API_SIGNUP_URL = `${DJANGO_API_ENDPOINT}/business/signup`

interface SignupRequest {
    username: string
    business_name: string
    password1: string
    password2: string
}


export async function POST(request: Request): Promise<Response> {
    const requestData: SignupRequest = await request.json()
    const { data, status } = await ApiProxy.post(DJANGO_API_SIGNUP_URL, requestData, false)

    if (status === 200) {
        console.log("signed in")
        // const { username, access, refresh } = data
        return NextResponse.json({ data: data}, { status: 200 })
    }

    const responseData = { message: "Signed up failed" }
    return NextResponse.json({ ...responseData }, { status: 400 })
}