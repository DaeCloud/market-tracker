import { NextResponse } from "next/server";
import { getTrackedSymbol } from "../../../../lib/db";
import { Response } from "../../../../lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> } // params is a Promise now
) {
  const { symbol } = await context.params; // <-- await it
  console.log(symbol);

  const trackedSymbol = await getTrackedSymbol(symbol);

  const responseData: Response = {
    status: "success",
    data: trackedSymbol
  };

  return NextResponse.json(responseData);
}
