"use client";

import { useState } from "react";

export function BuySharesButton({ symbols }: { symbols: string[] }) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState(symbols[0] ?? "");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    await fetch("/api/action/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        shares: Number(shares),
        price: Number(price),
      }),
    });

    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-6 rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Buy Shares
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">
              Buy Shares
            </h2>

            <div className="space-y-3">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                {symbols.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Shares"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-zinc-500"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={submit}
                className="rounded bg-green-600 px-4 py-2 text-sm text-white"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
