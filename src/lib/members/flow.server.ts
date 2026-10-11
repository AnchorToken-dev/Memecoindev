/**
 * Pure sign-in / session decisions for the members area (no framework imports,
 * so they're unit-testable). api.ts wires them to cookies and env.
 */
import { RECHECK_INTERVAL_MS } from "./config.ts";
import { checkSignIn, formatTokenAmount, meetsMinimum, newSession, readToken, type SessionPayload } from "./core.server.ts";
import { isOwner } from "./owners.ts";

type Balance = { raw: bigint; dec: number };
export type FlowCtx = {
  secret: string;
  host: string;
  minBalance: number;
  owners: string | undefined;
  readBalance: (owner: string) => Promise<Balance>;
};

export type SignInOutcome =
  | { kind: "error"; error: string }
  | { kind: "not_holder"; address: string; balance: string }
  | { kind: "holder"; session: SessionPayload; balance: string; owner: boolean };

export async function decideSignIn(ctx: FlowCtx, nonceToken: unknown, signature: unknown, now = Date.now()): Promise<SignInOutcome> {
  const check = checkSignIn(ctx.secret, nonceToken, signature, ctx.host, now);
  if (!check.ok) {
    const error =
      check.reason === "bad_nonce"
        ? "That sign-in request expired. Try again."
        : check.reason === "wrong_domain"
          ? "Sign-in was started on a different site address. Try again here."
          : "The wallet signature didn't check out. Try again.";
    return { kind: "error", error };
  }
  // Signature verified above. Only now may the owner allowlist stand in for the balance minimum.
  const owner = isOwner(check.nonce.a, ctx.owners);
  let balance: Balance;
  try {
    balance = await ctx.readBalance(check.nonce.a);
  } catch (err) {
    console.warn("[members] balance check failed", (err as Error).message);
    if (!owner) return { kind: "error", error: "Couldn't read your $ANCHOR balance from Solana right now. Try again in a minute." };
    balance = { raw: 0n, dec: 6 };
  }
  const shown = formatTokenAmount(balance.raw, balance.dec);
  if (!owner && !meetsMinimum(balance.raw, balance.dec, ctx.minBalance)) {
    return { kind: "not_holder", address: check.nonce.a, balance: shown };
  }
  const session = newSession(check.nonce.a, balance.raw, balance.dec, now);
  if (owner) session.o = 1;
  return { kind: "holder", session, balance: shown, owner };
}

export type StateOutcome =
  | { kind: "signed_out" }
  | { kind: "not_holder"; address: string; balance: string; clear: true }
  | { kind: "holder"; session: SessionPayload; balance: string; owner: boolean; recheckFailed: boolean; rewrite?: SessionPayload };

export async function decideState(ctx: FlowCtx, cookie: string | undefined, now = Date.now()): Promise<StateOutcome> {
  const session = readToken<SessionPayload>(ctx.secret, cookie, "session", now);
  if (!session) return { kind: "signed_out" };
  const stale = now - session.chk >= RECHECK_INTERVAL_MS;
  if (stale && isOwner(session.a, ctx.owners)) {
    // Owner list is re-read from env at every recheck; removal takes effect within the hour.
    const rewrite: SessionPayload = { ...session, chk: now, o: 1 };
    return { kind: "holder", session: rewrite, rewrite, balance: formatTokenAmount(session.raw, session.dec), owner: true, recheckFailed: false };
  }
  let raw = BigInt(session.raw);
  let dec = session.dec;
  let chk = session.chk;
  let recheckFailed = false;
  if (stale) {
    try {
      ({ raw, dec } = await ctx.readBalance(session.a));
      chk = now;
    } catch (err) {
      recheckFailed = true; // keep the last verified balance until the session expires (max 24h)
      console.warn("[members] balance recheck failed", (err as Error).message);
    }
  }
  const owner = !stale && session.o === 1;
  if (!owner && !meetsMinimum(raw, dec, ctx.minBalance)) {
    return { kind: "not_holder", address: session.a, balance: formatTokenAmount(raw, dec), clear: true };
  }
  let rewrite: SessionPayload | undefined;
  if (chk !== session.chk) {
    rewrite = { ...session, chk, raw: raw.toString(), dec };
    delete rewrite.o;
  }
  return { kind: "holder", session: rewrite ?? session, rewrite, balance: formatTokenAmount(raw, dec), owner, recheckFailed };
}
