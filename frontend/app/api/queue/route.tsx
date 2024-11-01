import { NextResponse } from "next/server";
import ApiProxy from "../proxy";
import { DJANGO_API_ENDPOINT } from "@/config/defaults";

const DJANGO_API_QUEUE_URL=`${DJANGO_API_ENDPOINT}/queue`
const DJANGO_API_ADD_QUEUE_URL=`${DJANGO_API_ENDPOINT}/business`

interface ErrorResponse {
    error: string;
}

export async function GET(request: Request) {
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(DJANGO_API_QUEUE_URL, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch business" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const requestData = await request.json()
    try {
        const { data, status }: { data: { msg: string }; status: number } = await ApiProxy.post(DJANGO_API_ADD_QUEUE_URL, requestData, true);
        if (data.msg === "This alphabet has been used.") {
            return NextResponse.json<{ error: string }>({ error: data.msg }, { status: 400 });
        }
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error adding entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to add entry" }, { status: 500 });
    }
}