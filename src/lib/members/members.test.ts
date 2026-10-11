import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { base58Decode, base58Encode, isSolanaAddress } from "./base58.ts";
import {
  buildSignInMessage,
  checkSignIn,
  formatTokenAmount,
  meetsMinimum,
  newNonce,
  newSession,
  parseMinBalance,
  readToken,
  signToken,
  sumTokenAccounts,
  type SessionPayload,
} from "./core.server.ts";
import { fetchTokenBalance } from "./balance.server.ts";
import { ANCHOR_MINT, NONCE_TTL_MS, SESSION_TTL_MS } from "./config.ts";

// Throwaway test-only values: a random HMAC secret and a freshly generated keypair.
const SECRET = randomBytes(32).toString("hex");

function throwawayWallet() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const raw = Buffer.from(publicKey.export({ format: "jwk" }).x as string, "base64url");
  const address = base58Encode(raw);
  const signB64 = (text: string) => sign(null, Buffer.from(text, "utf8"), privateKey).toString("base64");
  return { address, signB64 };
}

describe("base58", () => {
  it("round-trips, keeps leading zeros, decodes a real mint to 32 bytes", () => {
    for (let i = 0; i < 50; i++) {
      const bytes = randomBytes(32);
      if (i % 5 === 0) bytes[0] = 0;
      assert.deepEqual(Buffer.from(base58Decode(base58Encode(bytes))!), bytes);
    }
    assert.equal(base58Encode(new Uint8Array(32)), "1".repeat(32));
    assert.equal(base58Decode(ANCHOR_MINT)?.length, 32);
    assert.ok(isSolanaAddress(ANCHOR_MINT));
    assert.ok(!isSolanaAddress("0OIl" + "1".repeat(40)));
    assert.ok(!isSolanaAddress("abc"));
  });
});

describe("sign-in", () => {
  const host = "memecoindev.vip";

  it("accepts a valid wallet signature over the server-built message", () => {
    const w = throwawayWallet();
    const nonce = newNonce(w.address, host);
    const token = signToken(SECRET, nonce);
    const message = buildSignInMessage(nonce);
    assert.match(message, /^memecoindev\.vip wants you to sign in with your Solana account:\n/);
    assert.match(message, /Nonce: [0-9a-f]{32}/);
    const res = checkSignIn(SECRET, token, w.signB64(message), host);
    assert.equal(res.ok, true);
    if (res.ok) assert.equal(res.nonce.a, w.address);
  });

  it("rejects a signature from a different wallet", () => {
    const victim = throwawayWallet();
    const attacker = throwawayWallet();
    const nonce = newNonce(victim.address, host);
    const res = checkSignIn(SECRET, signToken(SECRET, nonce), attacker.signB64(buildSignInMessage(nonce)), host);
    assert.deepEqual(res, { ok: false, reason: "bad_signature" });
  });

  it("rejects a signature over different text", () => {
    const w = throwawayWallet();
    const nonce = newNonce(w.address, host);
    const res = checkSignIn(SECRET, signToken(SECRET, nonce), w.signB64(buildSignInMessage(nonce) + " "), host);
    assert.deepEqual(res, { ok: false, reason: "bad_signature" });
  });

  it("rejects forged, tampered, expired and cross-site nonces", () => {
    const w = throwawayWallet();
    const nonce = newNonce(w.address, host);
    const sig = w.signB64(buildSignInMessage(nonce));
    // signed with another secret
    assert.equal(checkSignIn(SECRET, signToken("x".repeat(64), nonce), sig, host).ok, false);
    // payload swapped to another address, old MAC kept
    const [, mac] = signToken(SECRET, nonce).split(".");
    const forgedBody = Buffer.from(JSON.stringify({ ...nonce, a: throwawayWallet().address })).toString("base64url");
    assert.equal(checkSignIn(SECRET, `${forgedBody}.${mac}`, sig, host).ok, false);
    // expired
    assert.deepEqual(
      checkSignIn(SECRET, signToken(SECRET, nonce), sig, host, nonce.iat + NONCE_TTL_MS + 1),
      { ok: false, reason: "bad_nonce" },
    );
    // issued for a different host
    assert.deepEqual(checkSignIn(SECRET, signToken(SECRET, nonce), sig, "evil.example"), {
      ok: false,
      reason: "wrong_domain",
    });
    // junk inputs
    assert.equal(checkSignIn(SECRET, "garbage", sig, host).ok, false);
    assert.equal(checkSignIn(SECRET, signToken(SECRET, nonce), "AAAA", host).ok, false);
    assert.equal(checkSignIn(SECRET, signToken(SECRET, nonce), 42, host).ok, false);
  });

  it("does not accept a nonce token as a session or vice versa", () => {
    const w = throwawayWallet();
    const nonceToken = signToken(SECRET, newNonce(w.address, host));
    assert.equal(readToken<SessionPayload>(SECRET, nonceToken, "session"), null);
    const sessionToken = signToken(SECRET, newSession(w.address, 1n, 6));
    assert.equal(checkSignIn(SECRET, sessionToken, w.signB64("x"), host).ok, false);
  });

  it("sessions last 24h and then stop validating", () => {
    const w = throwawayWallet();
    const s = newSession(w.address, 5n, 6, 1_000);
    assert.equal(s.exp - s.iat, SESSION_TTL_MS);
    const t = signToken(SECRET, s);
    assert.ok(readToken<SessionPayload>(SECRET, t, "session", 2_000));
    assert.equal(readToken<SessionPayload>(SECRET, t, "session", s.exp), null);
  });
});

describe("balance logic", () => {
  it("parses ANCHOR_MIN_BALANCE with a safe fallback", () => {
    assert.equal(parseMinBalance(undefined, 100_000), 100_000);
    assert.equal(parseMinBalance("250,000", 100_000), 250_000);
    assert.equal(parseMinBalance("1_000_000", 100_000), 1_000_000);
    assert.equal(parseMinBalance("lots", 100_000), 100_000);
    assert.equal(parseMinBalance("-5", 100_000), 100_000);
  });

  it("compares raw amounts against whole-token minimums exactly", () => {
    const dec = 6;
    const min = 100_000;
    assert.equal(meetsMinimum(100_000_000_000n, dec, min), true); // exactly 100k
    assert.equal(meetsMinimum(99_999_999_999n, dec, min), false); // 1 raw unit short
    assert.equal(meetsMinimum(0n, 0, min), false); // no token account
    assert.equal(meetsMinimum(0n, dec, 0), true); // min 0 lets everyone in
    assert.equal(meetsMinimum(1_500_000n, dec, 1.5), true);
    assert.equal(meetsMinimum(1_499_999n, dec, 1.5), false);
  });

  it("sums multiple token accounts for the mint and ignores others", () => {
    const acct = (mint: string, amount: string, decimals = 6) => ({
      account: { data: { parsed: { info: { mint, tokenAmount: { amount, decimals } } } } },
    });
    const r = sumTokenAccounts(
      [acct(ANCHOR_MINT, "60000000000"), acct(ANCHOR_MINT, "40000000000"), acct("So11111111111111111111111111111111111111112", "999999999999")],
      ANCHOR_MINT,
    );
    assert.deepEqual(r, { raw: 100_000_000_000n, dec: 6 });
    assert.equal(formatTokenAmount(r.raw, r.dec), "100,000");
    assert.deepEqual(sumTokenAccounts([], ANCHOR_MINT), { raw: 0n, dec: 0 });
    assert.throws(() => sumTokenAccounts(undefined, ANCHOR_MINT));
  });

  it("surfaces RPC failures as errors instead of a zero balance", async () => {
    const failing = (async () => new Response("rate limited", { status: 429 })) as typeof fetch;
    await assert.rejects(fetchTokenBalance(throwawayWallet().address, ANCHOR_MINT, undefined, failing), /429/);
    const rpcErr = (async () => Response.json({ jsonrpc: "2.0", error: { code: -32005 } })) as typeof fetch;
    await assert.rejects(fetchTokenBalance(throwawayWallet().address, ANCHOR_MINT, undefined, rpcErr), /-32005/);
  });
});
