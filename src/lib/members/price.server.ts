/**
 * Optional dollar-based minimum (ANCHOR_MIN_USD). Price sources, in order:
 *   1. DexScreener free API: highest-liquidity Solana pair where $ANCHOR is the base token.
 *   2. GeckoTerminal free API (if DexScreener has no pair or fails): highest
 *      reserve pool where $ANCHOR is the base token (this covers the pump.fun curve).
 *   3. No price: the caller falls back to ANCHOR_MIN_BALANCE.
 *
 * Smoothing (no database, so no true 24h average): we take the HIGHER of the
 * current price and the price 24h ago, derived from the source's 24h change
 * (DexScreener priceChange.h24 / GeckoTerminal price_change_percentage.h24)
 * as current / (1 + h24 / 100). A higher price means fewer
 * tokens required, so a sudden dump doesn't lock holders out, and a pump is
 * judged against its own current price.
 */

export const PRICE_TTL_MS = 5 * 60 * 1000;
const FAILURE_TTL_MS = 60 * 1000;
const DEXSCREENER_URL = "https://api.dexscreener.com/tokens/v1/solana/";
const GECKOTERMINAL_URL = "https://api.geckoterminal.com/api/v2/networks/solana/tokens/";

type DexPair = {
  chainId?: string;
  pairAddress?: string;
  dexId?: string;
  baseToken?: { address?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
};

export type SmoothedPrice = {
  priceUsd: number; // price used for the requirement
  currentUsd: number;
  ago24hUsd: number | null;
  method: "max_current_24h_ago" | "current_only";
  pair: string;
  dex: string;
  source: "dexscreener" | "geckoterminal";
};

type GeckoPool = {
  id?: string;
  attributes?: {
    address?: string;
    base_token_price_usd?: string;
    reserve_in_usd?: string;
    price_change_percentage?: { h24?: string | number };
  };
  relationships?: {
    base_token?: { data?: { id?: string } };
    dex?: { data?: { id?: string } };
  };
};

/** GeckoTerminal /tokens/{mint}/pools: highest-reserve pool with $ANCHOR as base token. */
export function pickBestGeckoPool(body: unknown, mint: string): GeckoPool | null {
  const pools = (body as { data?: unknown })?.data;
  if (!Array.isArray(pools)) return null;
  const valid = (pools as GeckoPool[]).filter((p) => {
    const price = Number(p?.attributes?.base_token_price_usd);
    return p?.relationships?.base_token?.data?.id === `solana_${mint}` && Number.isFinite(price) && price > 0;
  });
  valid.sort((a, b) => Number(b.attributes?.reserve_in_usd ?? 0) - Number(a.attributes?.reserve_in_usd ?? 0));
  return valid[0] ?? null;
}

function numberOrUndefined(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function pickBestPair(pairs: unknown, mint: string): DexPair | null {
  if (!Array.isArray(pairs)) return null;
  const valid = (pairs as DexPair[]).filter((p) => {
    const price = Number(p?.priceUsd);
    return p?.chainId === "solana" && p.baseToken?.address === mint && Number.isFinite(price) && price > 0;
  });
  valid.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  return valid[0] ?? null;
}

export function smoothPrice(currentUsd: number, change24hPct: unknown): Pick<SmoothedPrice, "priceUsd" | "currentUsd" | "ago24hUsd" | "method"> {
  const h24 = typeof change24hPct === "number" ? change24hPct : Number.NaN;
  if (!Number.isFinite(h24) || h24 <= -100) {
    return { priceUsd: currentUsd, currentUsd, ago24hUsd: null, method: "current_only" };
  }
  const ago = currentUsd / (1 + h24 / 100);
  return { priceUsd: Math.max(currentUsd, ago), currentUsd, ago24hUsd: ago, method: "max_current_24h_ago" };
}

/** Whole tokens needed for a dollar minimum, rounded up. */
export function tokensForUsd(minUsd: number, priceUsd: number): number | null {
  if (!(minUsd > 0) || !(priceUsd > 0) || !Number.isFinite(priceUsd)) return null;
  // Round away float noise (250000.00000000003) before rounding up.
  const tokens = Math.ceil(Math.round((minUsd / priceUsd) * 1e6) / 1e6);
  return Number.isSafeInteger(tokens) ? tokens : null;
}

export function parseMinUsd(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[$,_\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export type Requirement = {
  tokens: number;
  minUsd?: number;
  /** true when ANCHOR_MIN_USD is set but no price was available, so the token fallback applies */
  priceFallback?: boolean;
  priceUsd?: number;
};

export function resolveRequirement(
  minUsd: number | undefined,
  fallbackTokens: number,
  price: SmoothedPrice | null,
): Requirement {
  if (minUsd === undefined) return { tokens: fallbackTokens };
  const tokens = price ? tokensForUsd(minUsd, price.priceUsd) : null;
  if (tokens === null) return { tokens: fallbackTokens, minUsd, priceFallback: true };
  return { tokens, minUsd, priceUsd: price!.priceUsd };
}

let cache: { at: number; value: SmoothedPrice | null } | null = null;

export function clearPriceCache() {
  cache = null;
}

/** Cached ~5 min per server instance (failures cached 1 min). Never throws. */
export async function getSmoothedPrice(
  mint: string,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<SmoothedPrice | null> {
  if (cache && now - cache.at < (cache.value ? PRICE_TTL_MS : FAILURE_TTL_MS)) return cache.value;
  const value =
    (await fromDexScreener(mint, fetchImpl)) ?? (await fromGeckoTerminal(mint, fetchImpl));
  cache = { at: now, value };
  return value;
}

async function fromDexScreener(mint: string, fetchImpl: typeof fetch): Promise<SmoothedPrice | null> {
  try {
    const res = await fetchImpl(DEXSCREENER_URL + mint, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const pair = pickBestPair(await res.json(), mint);
    if (!pair) return null;
    return {
      ...smoothPrice(Number(pair.priceUsd), pair.priceChange?.h24),
      pair: pair.pairAddress ?? "",
      dex: pair.dexId ?? "",
      source: "dexscreener",
    };
  } catch (err) {
    console.warn("[members] DexScreener price failed", (err as Error).message);
    return null;
  }
}

async function fromGeckoTerminal(mint: string, fetchImpl: typeof fetch): Promise<SmoothedPrice | null> {
  try {
    const res = await fetchImpl(`${GECKOTERMINAL_URL}${mint}/pools`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null; // includes 429 rate limit
    const pool = pickBestGeckoPool(await res.json(), mint);
    if (!pool) return null;
    return {
      ...smoothPrice(
        Number(pool.attributes?.base_token_price_usd),
        numberOrUndefined(pool.attributes?.price_change_percentage?.h24),
      ),
      pair: pool.attributes?.address ?? pool.id?.replace(/^solana_/, "") ?? "",
      dex: pool.relationships?.dex?.data?.id ?? "",
      source: "geckoterminal",
    };
  } catch (err) {
    console.warn("[members] GeckoTerminal price failed", (err as Error).message);
    return null;
  }
}
