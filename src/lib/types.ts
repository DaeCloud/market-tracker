export interface Symbols {
  id: number;
  symbol: string;
  entered_symbol: string;
}

export interface Response {
  status: string;
  data?: any;
  message?: string;
}

export interface SymbolHistory {
  id: number;
  symbol_id: number;
  entered_symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_high: number;
  adj_low: number;
  adj_close: number;
  adj_open: number;
  adj_volume: number;
  split_factor: number;
  dividend: number;
  name: string;
  exchange_code: string;
  asset_type: string;
  price_currency: string;
  symbol: string;
  exchange: string;
  date: string;
}