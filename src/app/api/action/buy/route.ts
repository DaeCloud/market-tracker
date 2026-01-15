import { NextResponse } from "next/server";
import { buyStock } from "../../../../lib/db";

export async function POST(request: Request) {
    const { symbol, shares, price } = await request.json();

    console.log(`Buying ${shares} of ${symbol} at price ${price}`);

    await buyStock(symbol, shares, price);

    return NextResponse.json({ status: "success", message: `Bought ${shares} of ${symbol} at price ${price}` });
}
