"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";
// import ApiProxy2 from "@/app/api/proxy2";

const DJANGO_API_BUSINESS_PROFILE_URL = `${DJANGO_API_ENDPOINT}/business/profile`;
const DJANGO_API_BUSINESS_UPDATE_PROFILE_URL = `${DJANGO_API_ENDPOINT}/business/profile`

interface ErrorResponse {
    error: string;
}

export async function GET(request: Request) {
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(DJANGO_API_BUSINESS_PROFILE_URL, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch business" }, { status: 500 });
    }
}



// export async function PUT(request: Request) {
//     const endpoint = DJANGO_API_BUSINESS_UPDATE_PROFILE_URL;

//     // const requestData = await request.json();
//     const formData = await request.formData();
//     const files = formData.getAll('files') as File[];
//     console.log("Files:", files);

//     try {
//         const { data, status }: { data: any; status: number } = await ApiProxy.put(endpoint, files, true);
//         return NextResponse.json<any>(data, { status });
//     } catch (error) {
//         console.error("Error updating business:", error);
//         return NextResponse.json<ErrorResponse>({ error: "Failed to update business" }, { status: 500 });
//     }
// }



export async function POST(request: Request) {
    const endpoint = DJANGO_API_BUSINESS_UPDATE_PROFILE_URL;

    // Create FormData from the incoming request's form data
    const formData = await request.formData();
    // const file = formData.get('profile_image') as File;
    const file: File | null  = formData.get('file') as File;
    console.log("Form data:", formData);
    console.log("File:", file);
    // Prepare FormData to send to Django API
    // const formDataToSend = new FormData();
    // formDataToSend.append('profile_image', file); // Ensure 'profile_image' matches the field name expected by Django

    try {
        // Send FormData to Django API using ApiProxy
        const { data, status }: { data: any; status: number } = await ApiProxy.post(endpoint, formData, true);
        
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error updating business:", error);
        return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
    }
}
