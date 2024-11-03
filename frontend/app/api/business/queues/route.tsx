"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_BUSINESS_QUEUES_URL = `${DJANGO_API_ENDPOINT}/business/queues`;

interface ErrorResponse {
    error: string;
}

export async function GET(request: Request) {
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(DJANGO_API_BUSINESS_QUEUES_URL, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch business" }, { status: 500 });
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        const requestData = await request.json()
        const { data, status } = await ApiProxy.post(DJANGO_API_BUSINESS_QUEUES_URL, requestData, true)
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error adding queue:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to add queue" }, { status: 500 });
    }
}