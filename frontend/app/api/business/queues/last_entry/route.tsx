"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_LAST_ENTRY_QUEUES_URL = `${DJANGO_API_ENDPOINT}/queue/last-entry`;

interface ErrorResponse {
    error: string;
}

export async function GET() {
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(DJANGO_API_LAST_ENTRY_QUEUES_URL, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching last entry:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch last entry" }, { status: 500 });
    }
}
