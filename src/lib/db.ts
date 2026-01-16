import mysql from 'mysql2/promise';
import { Symbols, SymbolHistory } from './types';

/**
 * Create a connection pool.
 * Pooling is mandatory in serverless / Next.js.
 */
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * Generic query helper.
 * Strongly typed results if you pass a type.
 */
export async function query<T = any>(
    sql: string,
    params: any[] = []
): Promise<T[]> {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
}

export async function getTrackedSymbols(): Promise<SymbolHistory[] | []> {
    const rows = await query<SymbolHistory>(
        `SELECT
            s.symbol AS entered_symbol,
            h.*,
            o.shares AS owned_shares,
            o.price  AS owned_price
        FROM Symbols s
        LEFT JOIN (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY symbol
                    ORDER BY date DESC
                ) AS rn
            FROM History
        ) h
            ON h.symbol = s.symbol
        AND h.rn = 1
        LEFT JOIN Owned o
            ON o.symbol = s.symbol;
        `
    );

    return rows.length ? rows : [];
}

export async function getAllHistory(): Promise<Record<string, SymbolHistory[]>> {
    const rows = await query<SymbolHistory>(
        `SELECT *
         FROM History
         ORDER BY date DESC`
    );

    const symbolHistory: Record<string, SymbolHistory[]> = {};

    for (const row of rows) {
        const symbol = row.symbol;

        if (!symbolHistory[symbol]) {
            symbolHistory[symbol] = [];
        }

        symbolHistory[symbol].push(row);
    }

    return symbolHistory;
}

export async function getTrackedSymbolsPrevious(): Promise<Symbols[] | []> {
    const rows = await query<Symbols>(
        `SELECT
            s.symbol AS entered_symbol,
            h.*,
            o.shares AS owned_shares,
            o.price  AS owned_price
        FROM Symbols s
        LEFT JOIN (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY symbol
                    ORDER BY date DESC
                ) AS rn
            FROM History
        ) h
            ON h.symbol = s.symbol
        AND h.rn = 2
        LEFT JOIN Owned o
            ON o.symbol = s.symbol;
        `
    );

    return rows.length ? rows : [];
}

export async function getTrackedSymbol(symbol: string): Promise<Symbols[] | []> {
    const rows = await query<Symbols>(
        `SELECT *
     FROM Symbols
     WHERE symbol = ?`,
        [symbol]
    );

    return rows.length ? rows : [];
}

import type { ResultSetHeader } from 'mysql2';

export async function addTrackedSymbol(
    symbol: string
): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO Symbols (symbol)
     VALUES (?)`,
        [symbol]
    );

    return result.insertId;
}

export async function getSymbolHistory(symbol: string): Promise<SymbolHistory[] | []> {
    const rows = await query<SymbolHistory>(
        `SELECT *
     FROM History
     WHERE symbol = ?`,
        [symbol]
    );

    return rows.length ? rows : [];
}

export async function getLatestSymbolHistory(symbol: string): Promise<SymbolHistory | null> {
    const rows = await query<SymbolHistory>(
        `SELECT *
        FROM History
        WHERE symbol = ?
        ORDER BY date DESC
        LIMIT 1`,
        [symbol]
    );

    return rows.length ? rows[0] : null;
}

export async function getLatestSymbolClose(symbol: string): Promise<Number | null> {
    const rows = await query<SymbolHistory>(
        `SELECT close
        FROM History
        WHERE symbol = ?
        ORDER BY date DESC
        LIMIT 1`,
        [symbol]
    );

    console.log(rows);

    return rows.length ? Number(rows[0].close) : null;
}

function toSqlValue<T>(value: T | undefined): T | null {
    return value === undefined ? null : value;
}

export async function addToHistory(entry: Omit<SymbolHistory, 'id'>): Promise<number | null> {
    const {
        symbol_id, open, high, low, close, volume, adj_high, adj_low,
        adj_close, adj_open, adj_volume, split_factor,
        dividend, name, exchange_code, asset_type,
        price_currency, symbol, exchange, date
    } = entry;

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT IGNORE INTO History
     (symbol_id, open, high, low, close, volume, adj_high, adj_low,
      adj_close, adj_open, adj_volume, split_factor, dividend, name, exchange_code,
      asset_type, price_currency, symbol, exchange, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            toSqlValue(symbol_id),
            toSqlValue(open),
            toSqlValue(high),
            toSqlValue(low),
            toSqlValue(close),
            toSqlValue(volume),
            toSqlValue(adj_high),
            toSqlValue(adj_low),
            toSqlValue(adj_close),
            toSqlValue(adj_open),
            toSqlValue(adj_volume),
            toSqlValue(split_factor),
            toSqlValue(dividend),
            toSqlValue(name),
            toSqlValue(exchange_code),
            toSqlValue(asset_type),
            toSqlValue(price_currency),
            toSqlValue(symbol),
            toSqlValue(exchange),
            toSqlValue(date),
        ]
    );

    return result.insertId || null;
}


export async function buyStock(symbol: string, shares: number, price: number): Promise<void> {

    const [result] = await pool.execute(
        `INSERT INTO Owned (symbol, shares, price, purchase_date)
     VALUES (?, ?, ?, NOW())`,
        [symbol, shares, price]
    );

    return;
}