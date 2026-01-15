import { NextResponse } from "next/server";
import { getTrackedSymbol, addTrackedSymbol } from "../../../lib/db";
import { Response } from "../../../lib/types";

export async function POST(request: Request) {
    const { symbol } = await request.json();
    
    const findExisting = await getTrackedSymbol(symbol);

    if (findExisting.length) {
        const ResponseData: Response = {
            status: "error",
            message: "Symbol already tracked"
        };
        return NextResponse.json(ResponseData, { status: 400 });
    } else {
        const insertId = await addTrackedSymbol(symbol);

        const ResponseData: Response = {
            status: "success",
            data: { id: insertId, symbol }
        };

        return NextResponse.json(ResponseData, { status: 201 });
    }
}