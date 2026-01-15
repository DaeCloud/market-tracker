import { NextResponse } from "next/server";
import { getSymbolHistory } from "../../../../../lib/db";
import { Response } from "../../../../../lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> } // params is a Promise now
) {
  const { symbol } = await context.params; // <-- await it
  console.log(symbol);

  const symbolHistory = await getSymbolHistory(symbol);

  const responseData: Response = {
    status: "success",
    data: symbolHistory
  };

  return NextResponse.json(responseData);
}
