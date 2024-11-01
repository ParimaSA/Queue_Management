"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_ENTRY_URL = `${DJANGO_API_ENDPOINT}/entry`;

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params
    const endpoint = `${DJANGO_API_ENTRY_URL}/${id}/status/cancel` ;

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.post(endpoint, null, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error cancel entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to cancel entry" }, { status: 500 });
    }
}