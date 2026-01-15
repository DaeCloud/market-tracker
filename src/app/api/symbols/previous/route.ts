import { NextResponse } from "next/server";
import { getTrackedSymbolsPrevious } from "../../../../lib/db";
import { Response } from "../../../../lib/types";

export async function GET() {
    const symbols = await getTrackedSymbolsPrevious();

    const ResponseData: Response = {
        status: "success",
        data: symbols
    };
    
    return NextResponse.json(ResponseData);
}