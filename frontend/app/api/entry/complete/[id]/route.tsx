"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_ENTRY_URL = `${DJANGO_API_ENDPOINT}/entry`;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const endpoint = `${DJANGO_API_ENTRY_URL}/${id}/status/complete` ;

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.post(endpoint, null, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error completing entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to complete entry" }, { status: 500 });
    }
}