"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "@/app/api/proxy";

const DJANGO_API_CANCEL_ENTRY_URL = `${DJANGO_API_ENDPOINT}/entry/cancelEntry/`;

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_CANCEL_ENTRY_URL}${params.id}` : null;

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.post(endpoint, null, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error cancel entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to cancel entry" }, { status: 500 });
    }
}