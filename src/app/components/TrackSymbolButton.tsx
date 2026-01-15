"use client";

import { useState } from "react";

export function TrackSymbolButton() {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/symbol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol.toUpperCase() }),
    });

    if (!res.ok) {
      setError("Failed to track symbol");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setSymbol("");

    // simplest + safest refresh
    window.location.reload();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-6 rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-black dark:text-white"
      >
        Track Symbol
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">
              Track New Symbol
            </h2>

            <input
              autoFocus
              placeholder="e.g. AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full rounded border px-3 py-2 uppercase"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

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
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
