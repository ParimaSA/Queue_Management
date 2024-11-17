"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_ENTRY_IN_TIME_SLOT_URL = `${DJANGO_API_ENDPOINT}/analytic/estimate_waiting_time`;

interface ErrorResponse {
    error: string;
}

export async function GET(request: Request) {
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(DJANGO_API_ENTRY_IN_TIME_SLOT_URL, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch business" }, { status: 500 });
    }
}