import { NextResponse } from "next/server";
import { getTrackedSymbols, addToHistory } from "../../../lib/db";
import { Response } from "@/lib/types";

export async function GET() {
    const symbols = await getTrackedSymbols();


    const date10DaysAgo = new Date();
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 2);
    const formattedDate = date10DaysAgo.toISOString().split('T')[0];

    let queryParams = "?";
    queryParams += "access_key=" + process.env.MARKETSTACK_API_KEY;
    queryParams += `&date_from=${formattedDate}`;
    queryParams += `&date_to=${new Date().toISOString().split('T')[0]}`;
    queryParams += "&limit=1000";
    queryParams += `&symbols=${symbols.map(s => s.entered_symbol).join(",")}`;

    console.log("https://api.marketstack.com/v2/eod" + queryParams);

    const response = await fetch("https://api.marketstack.com/v2/eod" + queryParams);
    const data = await response.json();

    console.table(data);

    let updated = [];

    // Store fetched data into History table
    if (data && data.data && data.data.length) {
        for (const record of data.data) {
            const result = await addToHistory(record);
            if (result !== null) {
                updated.push(result);
            }
        }
    }

    const ResponseData: Response = {
        status: "success",
        data: updated
    };
    
    return NextResponse.json(ResponseData);
}