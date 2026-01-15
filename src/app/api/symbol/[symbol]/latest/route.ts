import { NextResponse } from "next/server";
import { getLatestSymbolHistory } from "../../../../../lib/db";
import { Response } from "../../../../../lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> } // params is a Promise now
) {
  const { symbol } = await context.params; // <-- await it

  const latestSymbolHistory = await getLatestSymbolHistory(symbol);

  const responseData: Response = {
    status: "success",
    data: latestSymbolHistory
  };

  return NextResponse.json(responseData);
}
