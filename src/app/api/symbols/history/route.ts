import { NextResponse } from "next/server";
import { getAllHistory } from "../../../../lib/db";
import { Response } from "../../../../lib/types";

export async function GET() {
  const history = await getAllHistory();

  const responseData: Response = {
    status: "success",
    data: history
  };

  return NextResponse.json(responseData);
}
