import { BuySharesButton } from "./components/BuySharesButton";
import { TrackSymbolButton } from "./components/TrackSymbolButton";
import { SymbolsTable } from "./components/SymbolsTable";

type SymbolRow = {
  id: number;
  symbol: string;
  entered_symbol: string;
  name: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  exchange_code: string | null;
  price_currency: string | null;
  date: string;

  // ownership (nullable)
  owned_shares?: number | null;
  owned_price?: number | null;
};


type ApiResponse = {
  status: "success" | "error";
  data: SymbolRow[];
};

/* ---------------- data fetching ---------------- */

async function getSymbols(url: string): Promise<SymbolRow[]> {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const json: ApiResponse = await res.json();
  return json.data;
}

/* ---------------- page ---------------- */

export default async function Home() {
  const [current, previous] = await Promise.all([
    getSymbols("http://localhost:3000/api/symbols"),
    getSymbols("http://localhost:3000/api/symbols/previous"),
  ]);

  // Map previous day by symbol for fast lookup
  const previousBySymbol = new Map(
    previous.map((p) => [p.symbol, p])
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-8xl flex-col py-24 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-8">
          DaeCloud Market Tracker
        </h1>

        <div className="mb-6 flex gap-3">
          <BuySharesButton symbols={current.map(s => s.symbol)} />
          <TrackSymbolButton />
        </div>

        <SymbolsTable
          current={current}
          previousBySymbol={previousBySymbol}
        />
      </main>
    </div>
  );
}
