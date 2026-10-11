/**
 * Pure server-side logic for holder sign-in: signed tokens, Sign-In With
 * Solana message, ed25519 verification and balance math. No framework
 * imports, so it runs under `node --test` directly.
 */
import { createHmac, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";
import { base58Decode, isSolanaAddress } from "./base58.ts";
import { NONCE_TTL_MS, SESSION_TTL_MS } from "./config.ts";

export type NoncePayload = {
  p: "nonce";
  a: string; // wallet address
  d: string; // domain (host) the user signed in on
  n: string; // random nonce
  iat: number;
  exp: number;
};

export type SessionPayload = {
  p: "session";
  a: string;
  iat: number;
  exp: number;
  chk: number; // last balance check (ms)
  raw: string; // raw token amount at last check
  dec: number; // mint decimals
  o?: 1; // owner allowlist session (still signature-verified; HMAC-signed)
};

const b64url = (buf: Buffer) => buf.toString("base64url");

function hmac(secret: string, data: string): Buffer {
  return createHmac("sha256", secret).update(data).digest();
}

export function signToken(secret: string, payload: NoncePayload | SessionPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${b64url(hmac(secret, body))}`;
}

export function readToken<T extends NoncePayload | SessionPayload>(
  secret: string,
  token: unknown,
  purpose: T["p"],
  now = Date.now(),
): T | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [body, mac, extra] = token.split(".");
  if (!body || !mac || extra !== undefined) return null;
  const expected = hmac(secret, body);
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  let payload: T;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
  if (payload?.p !== purpose || typeof payload.exp !== "number" || payload.exp <= now) return null;
  if (!isSolanaAddress(payload.a)) return null;
  return payload;
}

export function newNonce(address: string, domain: string, now = Date.now()): NoncePayload {
  return {
    p: "nonce",
    a: address,
    d: domain,
    n: randomBytes(16).toString("hex"),
    iat: now,
    exp: now + NONCE_TTL_MS,
  };
}

/** Sign-In With Solana style message (CAIP-122 / EIP-4361 layout). */
export function buildSignInMessage(n: NoncePayload): string {
  return [
    `${n.d} wants you to sign in with your Solana account:`,
    n.a,
    "",
    "Sign in to the MemecoinDev members area. This only proves you own this wallet. It does not move funds, approve a transaction, or share your seed phrase or private key.",
    "",
    `URI: https://${n.d}/members`,
    "Version: 1",
    "Chain ID: mainnet",
    `Nonce: ${n.n}`,
    `Issued At: ${new Date(n.iat).toISOString()}`,
    `Expiration Time: ${new Date(n.exp).toISOString()}`,
  ].join("\n");
}

// DER prefix for an Ed25519 SubjectPublicKeyInfo; the 32 raw key bytes follow.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function verifyWalletSignature(
  address: string,
  message: string,
  signature: Uint8Array,
): boolean {
  const pub = base58Decode(address);
  if (!pub || pub.length !== 32 || signature.length !== 64) return false;
  try {
    const key = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(pub)]),
      format: "der",
      type: "spki",
    });
    return verify(null, Buffer.from(message, "utf8"), key, Buffer.from(signature));
  } catch {
    return false;
  }
}

export type SignInCheck =
  | { ok: true; nonce: NoncePayload }
  | { ok: false; reason: "bad_nonce" | "wrong_domain" | "bad_signature" };

/**
 * The server rebuilds the message from its own signed nonce token, so the
 * client can't swap in different text. Checks: token authentic + unexpired,
 * same host the nonce was issued for, and the wallet's signature over it.
 */
export function checkSignIn(
  secret: string,
  nonceToken: unknown,
  signatureB64: unknown,
  domain: string,
  now = Date.now(),
): SignInCheck {
  const nonce = readToken<NoncePayload>(secret, nonceToken, "nonce", now);
  if (!nonce) return { ok: false, reason: "bad_nonce" };
  if (nonce.d !== domain) return { ok: false, reason: "wrong_domain" };
  if (typeof signatureB64 !== "string" || signatureB64.length > 200) {
    return { ok: false, reason: "bad_signature" };
  }
  const sig = Buffer.from(signatureB64, "base64");
  if (!verifyWalletSignature(nonce.a, buildSignInMessage(nonce), sig)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true, nonce };
}

export function newSession(address: string, raw: bigint, dec: number, now = Date.now()): SessionPayload {
  return { p: "session", a: address, iat: now, exp: now + SESSION_TTL_MS, chk: now, raw: raw.toString(), dec };
}

/** Parse ANCHOR_MIN_BALANCE (whole tokens). Invalid values fall back to the default. */
export function parseMinBalance(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value.replace(/[_,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** raw >= min * 10^dec, done in integers so huge supplies don't lose precision. */
export function meetsMinimum(raw: bigint, dec: number, minWholeTokens: number): boolean {
  const [whole, frac = ""] = String(minWholeTokens).split(".");
  const fracPadded = (frac + "0".repeat(dec)).slice(0, dec);
  const minRaw = BigInt(whole) * 10n ** BigInt(dec) + BigInt(fracPadded || "0");
  return raw >= minRaw;
}

export function formatTokenAmount(raw: string | bigint, dec: number): string {
  const r = BigInt(raw);
  const whole = r / 10n ** BigInt(dec);
  return whole.toLocaleString("en-US");
}

type ParsedTokenAccount = {
  account?: { data?: { parsed?: { info?: { mint?: string; tokenAmount?: { amount?: string; decimals?: number } } } } };
};

/** Sum a getTokenAccountsByOwner (jsonParsed) result for one mint. */
export function sumTokenAccounts(
  value: unknown,
  mint: string,
): { raw: bigint; dec: number } {
  let raw = 0n;
  let dec = 0;
  if (!Array.isArray(value)) throw new Error("unexpected RPC shape");
  for (const item of value as ParsedTokenAccount[]) {
    const info = item?.account?.data?.parsed?.info;
    if (!info || info.mint !== mint) continue;
    const amount = info.tokenAmount?.amount;
    if (typeof amount !== "string" || !/^\d+$/.test(amount)) continue;
    raw += BigInt(amount);
    dec = typeof info.tokenAmount?.decimals === "number" ? info.tokenAmount.decimals : dec;
  }
  return { raw, dec };
}
