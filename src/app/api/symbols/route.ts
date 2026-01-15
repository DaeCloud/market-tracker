import { NextResponse } from "next/server";
import { getTrackedSymbols } from "../../../lib/db";
import { Response } from "../../../lib/types";

export async function GET() {
    const symbols = await getTrackedSymbols();

    const ResponseData: Response = {
        status: "success",
        data: symbols
    };
    
    return NextResponse.json(ResponseData);
}