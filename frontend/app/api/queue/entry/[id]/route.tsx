"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "../../../proxy";

const DJANGO_API_QUEUE_URL = `${DJANGO_API_ENDPOINT}/queue`

interface ErrorResponse {
    error: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_QUEUE_URL}/${params.id}/entries` : null;
    if (!endpoint) {
        return NextResponse.json<ErrorResponse>({ error: "ID parameter is missing" }, { status: 400 });
    }

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(endpoint, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error fetching entries:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch entries" }, { status: 500 });
    }
}