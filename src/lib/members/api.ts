/**
 * Server functions for the holder-gated members area. All secrets, RPC
 * access and signature checks stay inside the handlers (server-only).
 *
 * Env (memecoindev Vercel project):
 *   MEMBERS_SESSION_SECRET  required, 32+ random chars; signs nonces + session cookie.
 *                           Missing -> sign-in shows as "being set up" (fails closed).
 *   ANCHOR_MIN_BALANCE      whole $ANCHOR tokens needed (default DEFAULT_MIN_BALANCE = 500,000).
 *   ANCHOR_MIN_USD          optional dollar minimum; tokens = USD / smoothed DexScreener price
 *                           (see price.server.ts). Falls back to ANCHOR_MIN_BALANCE without a price.
 *   SOLANA_RPC_URL          optional; public mainnet RPC when unset.
 */
import { createServerFn } from "@tanstack/react-start";
import type { MembersState } from "./config.ts";

async function serverCtx() {
  const [{ getRequest, getCookie, setCookie }, core, cfg, bal, price] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("./core.server.ts"),
    import("./config.ts"),
    import("./balance.server.ts"),
    import("./price.server.ts"),
  ]);
  const secret = process.env.MEMBERS_SESSION_SECRET?.trim();
  const fallbackTokens = core.parseMinBalance(process.env.ANCHOR_MIN_BALANCE, cfg.DEFAULT_MIN_BALANCE);
  const minUsd = price.parseMinUsd(process.env.ANCHOR_MIN_USD);
  const requirement = price.resolveRequirement(
    minUsd,
    fallbackTokens,
    minUsd === undefined ? null : await price.getSmoothedPrice(cfg.ANCHOR_MINT),
  );
  const minBalance = requirement.tokens;
  const reqInfo = { minUsd: requirement.minUsd, priceFallback: requirement.priceFallback };
  const rpcUrl = process.env.SOLANA_RPC_URL?.trim() || undefined;

  const request = getRequest();
  const host = (
    request?.headers.get("x-forwarded-host")?.split(",")[0] ||
    request?.headers.get("host") ||
    (request ? new URL(request.url).host : "")
  )
    .trim()
    .toLowerCase();

  const writeSession = (payload: import("./core.server.ts").SessionPayload | null) => {
    setCookie(cfg.SESSION_COOKIE, payload && secret ? core.signToken(secret, payload) : "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: payload ? Math.max(0, Math.floor((payload.exp - Date.now()) / 1000)) : 0,
    });
  };

  return {
    core,
    cfg,
    secret: secret && secret.length >= 32 ? secret : undefined,
    minBalance,
    reqInfo,
    host,
    readBalance: (owner: string) => bal.fetchTokenBalance(owner, cfg.ANCHOR_MINT, rpcUrl),
    sessionCookie: () => getCookie(cfg.SESSION_COOKIE),
    writeSession,
  };
}

export const getMembersState = createServerFn({ method: "GET" }).handler(
  async (): Promise<MembersState> => {
    const ctx = await serverCtx();
    const { core, cfg, minBalance } = ctx;
    if (!ctx.secret) return { status: "disabled", minBalance, ...ctx.reqInfo };

    const session = core.readToken<import("./core.server.ts").SessionPayload>(
      ctx.secret,
      ctx.sessionCookie(),
      "session",
    );
    if (!session) return { status: "signed_out", minBalance, ...ctx.reqInfo };

    let { raw, dec, chk } = { raw: BigInt(session.raw), dec: session.dec, chk: session.chk };
    let recheckFailed = false;
    const now = Date.now();
    if (now - chk >= cfg.RECHECK_INTERVAL_MS) {
      try {
        ({ raw, dec } = await ctx.readBalance(session.a));
        chk = now;
      } catch (err) {
        // Keep the last verified balance until the session expires (max 24h).
        recheckFailed = true;
        console.warn("[members] balance recheck failed", (err as Error).message);
      }
    }

    if (!core.meetsMinimum(raw, dec, minBalance)) {
      ctx.writeSession(null);
      return {
        status: "not_holder",
        minBalance,
        ...ctx.reqInfo,
        address: session.a,
        balance: core.formatTokenAmount(raw, dec),
      };
    }
    if (chk !== session.chk) ctx.writeSession({ ...session, chk, raw: raw.toString(), dec });
    return {
      status: "holder",
      minBalance,
      ...ctx.reqInfo,
      address: session.a,
      balance: core.formatTokenAmount(raw, dec),
      checkedAt: chk,
      expiresAt: session.exp,
      recheckFailed: recheckFailed || undefined,
    };
  },
);

export const requestSignInNonce = createServerFn({ method: "POST" })
  .validator((data: { address: string }) => data)
  .handler(async ({ data }): Promise<{ ok: true; nonceToken: string; message: string } | { ok: false; error: string }> => {
    const ctx = await serverCtx();
    if (!ctx.secret) return { ok: false, error: "Holder sign-in is still being set up." };
    const { isSolanaAddress } = await import("./base58.ts");
    if (!isSolanaAddress(data?.address)) return { ok: false, error: "That doesn't look like a Solana wallet address." };
    if (!ctx.host) return { ok: false, error: "Could not start sign-in. Refresh and try again." };
    const nonce = ctx.core.newNonce(data.address, ctx.host);
    return { ok: true, nonceToken: ctx.core.signToken(ctx.secret, nonce), message: ctx.core.buildSignInMessage(nonce) };
  });

export const completeSignIn = createServerFn({ method: "POST" })
  .validator((data: { nonceToken: string; signature: string }) => data)
  .handler(async ({ data }): Promise<MembersState | { status: "error"; error: string }> => {
    const ctx = await serverCtx();
    const { core, minBalance } = ctx;
    if (!ctx.secret) return { status: "disabled", minBalance, ...ctx.reqInfo };
    const check = core.checkSignIn(ctx.secret, data?.nonceToken, data?.signature, ctx.host);
    if (!check.ok) {
      const error =
        check.reason === "bad_nonce"
          ? "That sign-in request expired. Try again."
          : check.reason === "wrong_domain"
            ? "Sign-in was started on a different site address. Try again here."
            : "The wallet signature didn't check out. Try again.";
      return { status: "error", error };
    }
    let balance: { raw: bigint; dec: number };
    try {
      balance = await ctx.readBalance(check.nonce.a);
    } catch (err) {
      console.warn("[members] balance check failed", (err as Error).message);
      return { status: "error", error: "Couldn't read your $ANCHOR balance from Solana right now. Try again in a minute." };
    }
    if (!core.meetsMinimum(balance.raw, balance.dec, minBalance)) {
      ctx.writeSession(null);
      return {
        status: "not_holder",
        minBalance,
        ...ctx.reqInfo,
        address: check.nonce.a,
        balance: core.formatTokenAmount(balance.raw, balance.dec),
      };
    }
    const session = core.newSession(check.nonce.a, balance.raw, balance.dec);
    ctx.writeSession(session);
    return {
      status: "holder",
      minBalance,
      ...ctx.reqInfo,
      address: session.a,
      balance: core.formatTokenAmount(balance.raw, balance.dec),
      checkedAt: session.chk,
      expiresAt: session.exp,
    };
  });

export const signOutMembers = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await serverCtx();
  ctx.writeSession(null);
  return { ok: true };
});
