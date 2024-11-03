"use server"
import { DJANGO_API_ENDPOINT } from '@/config/defaults'
import { setRefreshToken, setToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import ApiProxy from '../proxy';

const DJANGO_API_REGISTER_URL = `${DJANGO_API_ENDPOINT}/business/register`

interface SignupRequest {
    username: string
    business_name: string
    password1: string
    password2: string
}


export async function POST(request: Request): Promise<Response> {
    const requestData: SignupRequest = await request.json()
    const { data, status } = await ApiProxy.post(DJANGO_API_REGISTER_URL, requestData, false)

    return NextResponse.json(data, { status: status })
}