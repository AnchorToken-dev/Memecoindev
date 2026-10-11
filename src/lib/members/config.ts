/** Client-safe constants for the holder-gated members area. */
export const ANCHOR_MINT = "3jhApg98ukHe2EZFDsZ92J2KhMuMY5CW3NpCdt5spump";
export const ANCHOR_PUMP_URL = `https://pump.fun/${ANCHOR_MINT}`;
export const ANCHOR_SITE_URL = "https://anchortoken.vip";
export const RUG_CHECK_URL = "https://rugcheck.memecoindev.vip";

/** Placeholder until Mark picks the real number (env ANCHOR_MIN_BALANCE overrides). */
export const DEFAULT_MIN_BALANCE = 500_000;

/** Signed-in session length. */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
/** How often the $ANCHOR balance is re-read while a session is live. */
export const RECHECK_INTERVAL_MS = 60 * 60 * 1000;
/** How long a sign-in nonce stays valid. */
export const NONCE_TTL_MS = 5 * 60 * 1000;

export const SESSION_COOKIE = "mcd_members";

/** What the gate/dashboard show as the requirement. */
export type RequirementInfo = {
  /** ANCHOR_MIN_USD when set */
  minUsd?: number;
  /** ANCHOR_MIN_USD is set but no price was available; minBalance is the token fallback */
  priceFallback?: boolean;
};

export type MembersState = RequirementInfo & (
  | { status: "disabled"; minBalance: number }
  | { status: "signed_out"; minBalance: number }
  | {
      status: "not_holder";
      minBalance: number;
      address: string;
      balance: string;
    }
  | {
      status: "holder";
      minBalance: number;
      address: string;
      balance: string;
      checkedAt: number;
      expiresAt: number;
      recheckFailed?: boolean;
      owner?: boolean;
    }
);

export function shortAddress(address: string): string {
  return address.length > 10 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address;
}
