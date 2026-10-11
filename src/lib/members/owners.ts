/**
 * Owner allowlist (env OWNER_WALLETS, comma-separated public addresses).
 * Consulted only AFTER the wallet signature is verified; it replaces the
 * balance minimum, never the signature check. Invalid entries are ignored.
 */
import { isSolanaAddress } from "./base58.ts";

export function parseOwnerWallets(value: string | undefined): Set<string> {
  const out = new Set<string>();
  for (const part of (value ?? "").split(/[\s,]+/)) {
    const a = part.trim();
    if (a && isSolanaAddress(a)) out.add(a);
  }
  return out;
}

export function isOwner(address: string, value: string | undefined): boolean {
  return parseOwnerWallets(value).has(address);
}
