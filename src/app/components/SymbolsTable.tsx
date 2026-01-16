"use client";

import { useState } from "react";
import { SymbolHistory } from "../../lib/types";
import { Sparklines, SparklinesLine } from "react-sparklines";

type SymbolRow = {
    id: number;
    symbol: string;
    entered_symbol: string;
    name: string | null;
    close: number | null;
    volume: number | null;
    price_currency: string | null;
    date: string;
    owned_shares?: number | null;
    owned_price?: number | null;
};

export function SymbolsTable({
    current,
    previousBySymbol,
    history,
}: {
    current: SymbolRow[];
    previousBySymbol: Map<string, SymbolRow>;
    history: Record<string, SymbolHistory[]>;
}) {
    const [ownedOnly, setOwnedOnly] = useState(false);

    const rows = ownedOnly
        ? current.filter((s) => (s.owned_shares ?? 0) > 0)
        : current;

    return (
        <>
            {/* Toggle */}
            <div className="mb-4 flex items-center gap-3">
                <button
                    onClick={() => setOwnedOnly((v) => !v)}
                    className="rounded-lg border px-3 py-1.5 text-sm dark:border-zinc-700"
                >
                    {ownedOnly ? "Show All Symbols" : "Show Owned Only"}
                </button>

                <span className="text-sm text-zinc-500">
                    {ownedOnly
                        ? `${rows.length} owned`
                        : `${rows.length} total`}
                </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-100 dark:bg-zinc-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Symbol</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-right">Close</th>
                            <th className="px-4 py-3 text-right">Trend</th>
                            <th className="px-4 py-3 text-right">Change</th>
                            <th className="px-4 py-3 text-right">% Change</th>
                            <th className="px-4 py-3 text-right">Volume</th>
                            <th className="px-4 py-3 text-right">Shares</th>
                            <th className="px-4 py-3 text-right">Avg Buy</th>
                            <th className="px-4 py-3 text-right">Value</th>
                            <th className="px-4 py-3 text-right">P/L</th>
                            <th className="px-4 py-3 text-right">% P/L</th>
                            <th className="px-4 py-3 text-left">Date Updated</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((s) => {
                            const prev = previousBySymbol.get(s.symbol);

                            const close = s.close;
                            const prevClose = prev?.close ?? null;

                            const diff =
                                close != null && prevClose != null
                                    ? close - prevClose
                                    : null;

                            const diffPct =
                                diff != null && prevClose
                                    ? (diff / prevClose) * 100
                                    : null;

                            const trend =
                                diff == null
                                    ? "neutral"
                                    : diff > 0
                                        ? "up"
                                        : diff < 0
                                            ? "down"
                                            : "neutral";

                            const shares = s.owned_shares ?? 0;
                            const avgBuy = s.owned_price ?? null;

                            const marketValue =
                                shares && close != null ? shares * close : null;

                            const costBasis =
                                shares && avgBuy != null ? shares * avgBuy : null;

                            const pnl =
                                marketValue != null && costBasis != null
                                    ? marketValue - costBasis
                                    : null;

                            const pnlPct =
                                pnl != null && costBasis
                                    ? (pnl / costBasis) * 100
                                    : null;

                            const pnlTrend =
                                pnl == null ? "neutral" : pnl > 0 ? "up" : pnl < 0 ? "down" : "neutral";

                            const symbolHistory = history[s.symbol] ?? [];

                            const closes = symbolHistory
                                .slice(-30)
                                .reverse() // oldest → newest (important for left→right)
                                .map(h => h.close)
                                .filter((v): v is number => v != null);

                            return (
                                <tr
                                    key={s.id}
                                    className="border-t border-zinc-200 dark:border-zinc-800"
                                >
                                    <td className="px-4 py-2 font-medium">
                                        {s.entered_symbol}
                                    </td>

                                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                                        {s.name ?? "-"}
                                    </td>

                                    <td className="px-4 py-2 text-right font-semibold">
                                        {fmtPrice(close, s.price_currency)}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        {closes.length > 1 ? (
                                            <Sparklines data={closes} width={80} height={20}>
                                                <SparklinesLine
                                                    color={
                                                        closes[closes.length - 1] >= closes[0]
                                                            ? "#16a34a" // green
                                                            : "#dc2626" // red
                                                    }
                                                    style={{ strokeWidth: 2, fill: "none" }}
                                                />
                                            </Sparklines>
                                        ) : (
                                            "-"
                                        )}
                                    </td>


                                    <td
                                        className={cls(
                                            "px-4 py-2 text-right font-medium",
                                            trend === "up" && "text-green-600",
                                            trend === "down" && "text-red-600"
                                        )}
                                    >
                                        {trend === "up" && "▲ "}
                                        {trend === "down" && "▼ "}
                                        {fmtPrice(diff, s.price_currency)}
                                    </td>

                                    <td
                                        className={cls(
                                            "px-4 py-2 text-right",
                                            trend === "up" && "text-green-600",
                                            trend === "down" && "text-red-600"
                                        )}
                                    >
                                        {diffPct == null
                                            ? "-"
                                            : `${diffPct.toFixed(2)}%`}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        {fmtNumber(s.volume)}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        {shares ? shares.toLocaleString() : "-"}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        {shares ? fmtPrice(avgBuy, s.price_currency) : "-"}
                                    </td>

                                    <td className="px-4 py-2 text-right font-medium">
                                        {fmtPrice(marketValue, s.price_currency)}
                                    </td>

                                    <td
                                        className={cls(
                                            "px-4 py-2 text-right font-medium",
                                            pnlTrend === "up" && "text-green-600",
                                            pnlTrend === "down" && "text-red-600"
                                        )}
                                    >
                                        {pnlTrend === "up" && "▲ "}
                                        {pnlTrend === "down" && "▼ "}
                                        {fmtPrice(pnl, s.price_currency)}
                                    </td>

                                    <td
                                        className={cls(
                                            "px-4 py-2 text-right",
                                            pnlTrend === "up" && "text-green-600",
                                            pnlTrend === "down" && "text-red-600"
                                        )}
                                    >
                                        {pnlPct == null ? "-" : `${pnlPct.toFixed(2)}%`}
                                    </td>


                                    <td className="px-4 py-2">
                                        {new Date(s.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

/* ---------- helpers ---------- */

function fmtPrice(value: number | null, currency: string | null) {
    if (value == null) return "-";
    if (!currency) return value.toLocaleString();

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

function fmtNumber(value: number | null): string {
    if (value == null) return "-";
    return value.toLocaleString();
}

function cls(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
