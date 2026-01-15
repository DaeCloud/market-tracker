import { NextResponse } from "next/server";
import { getLatestSymbolClose } from "../../../../../../lib/db";
import { Response } from "../../../../../../lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> } // params is a Promise now
) {
  const { symbol } = await context.params; // <-- await it

  const latestSymbolClose = await getLatestSymbolClose(symbol);

  const responseData: Response = {
    status: "success",
    data: latestSymbolClose
  };

  return NextResponse.json(responseData);
}
