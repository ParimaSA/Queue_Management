"use server";

import { deleteTokens } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
    await deleteTokens(); 
    return NextResponse.json({}, { status: 200 }); 
}