"use server";

import { deleteTokens } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    deleteTokens(); 
    return NextResponse.json({}, { status: 200 }); 
}