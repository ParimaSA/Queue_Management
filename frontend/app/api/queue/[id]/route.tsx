"use server";

import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { NextResponse } from "next/server";
import ApiProxy from "../../proxy";

const DJANGO_API_GET_ENTRY_URL = `${DJANGO_API_ENDPOINT}/queue/get_entry/`;
const DJANGO_API_ADD_ENTRY_URL = `${DJANGO_API_ENDPOINT}/queue/add_entry/`;
const DJANGO_API_EDIT_QUEUE_URL = `${DJANGO_API_ENDPOINT}/queue/editQueue/`;
const DJANGO_API_DELETE_QUEUE_URL = `${DJANGO_API_ENDPOINT}/queue/deleteQueue/`;


interface ErrorResponse {
    error: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_GET_ENTRY_URL}${params.id}` : null;

    if (!endpoint) {
        return NextResponse.json<ErrorResponse>({ error: "ID parameter is missing" }, { status: 400 });
    }

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.get(endpoint, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error fetching entry:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to fetch entry" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_ADD_ENTRY_URL}${params.id}` : null;

    if (!endpoint) {
        return NextResponse.json<{ error: string }>({ error: "ID parameter is missing" }, { status: 400 });
    }

    try {
        const { data, status }: { data: { msg: string }; status: number } = await ApiProxy.post(endpoint, null, true);
        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("Error adding entry:", error);
        return NextResponse.json<{ error: string }>({ error: "Failed to add entry" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_EDIT_QUEUE_URL}${params.id}` : null;

    if (!endpoint) {
        return NextResponse.json<ErrorResponse>({ error: "ID parameter is missing" }, { status: 400 });
    }

    const requestData = await request.json();
    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.put(endpoint, requestData, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error updating entry:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to update entry" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const endpoint = params?.id ? `${DJANGO_API_DELETE_QUEUE_URL}${params.id}` : null;

    if (!endpoint) {
        return NextResponse.json<ErrorResponse>({ error: "ID parameter is missing" }, { status: 400 });
    }

    try {
        const { data, status }: { data: any; status: number } = await ApiProxy.delete(endpoint, true);
        return NextResponse.json<any>(data, { status });
    } catch (error) {
        console.error("Error deleting entry:", error);
        return NextResponse.json<ErrorResponse>({ error: "Failed to delete entry" }, { status: 500 });
    }
}