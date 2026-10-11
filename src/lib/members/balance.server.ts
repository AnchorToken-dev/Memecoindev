import { sumTokenAccounts } from "./core.server.ts";

const PUBLIC_RPC = "https://api.mainnet-beta.solana.com";

/**
 * Reads a wallet's balance of one mint server-side. Uses SOLANA_RPC_URL when
 * set on the deployment, otherwise the public mainnet RPC. The URL is never
 * logged or returned.
 */
export async function fetchTokenBalance(
  owner: string,
  mint: string,
  rpcUrl: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<{ raw: bigint; dec: number }> {
  const res = await fetchImpl(rpcUrl || PUBLIC_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [owner, { mint }, { encoding: "jsonParsed", commitment: "confirmed" }],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`balance RPC HTTP ${res.status}`);
  const json = (await res.json()) as { result?: { value?: unknown }; error?: { code?: number } };
  if (json.error) throw new Error(`balance RPC error ${json.error.code ?? ""}`.trim());
  return sumTokenAccounts(json.result?.value, mint);
}
