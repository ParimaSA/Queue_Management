"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "../../proxy";

const DJANGO_API_ENTRY_URL = `${DJANGO_API_ENDPOINT}/entry/tracking-code`;

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params; 
    const endpoint = `${DJANGO_API_ENTRY_URL}/${id}`;

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(endpoint, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error completing entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to complete entry" }, { status: 500 });
    }
}
