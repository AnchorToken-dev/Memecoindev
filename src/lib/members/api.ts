/**
 * Server functions for the holder-gated members area. All secrets, RPC
 * access and signature checks stay inside the handlers (server-only).
 *
 * Env (memecoindev Vercel project):
 *   MEMBERS_SESSION_SECRET  required, 32+ random chars; signs nonces + session cookie.
 *                           Missing -> sign-in shows as "being set up" (fails closed).
 *   ANCHOR_MIN_BALANCE      whole $ANCHOR tokens needed (default DEFAULT_MIN_BALANCE = 5,000).
 *   ANCHOR_MIN_USD          optional dollar minimum; tokens = USD / smoothed price (DexScreener, then GeckoTerminal)
 *                           (see price.server.ts). Falls back to ANCHOR_MIN_BALANCE without a price.
 *   SOLANA_RPC_URL          optional; public mainnet RPC when unset.
 *   OWNER_WALLETS           optional comma-separated owner addresses: skip the balance minimum
 *                           after a VALID signature (see owners.ts / flow.server.ts).
 */
import { createServerFn } from "@tanstack/react-start";
import type { MembersState } from "./config.ts";

async function serverCtx() {
  const [{ getRequest, getCookie, setCookie }, core, cfg, bal, price, flow] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("./core.server.ts"),
    import("./config.ts"),
    import("./balance.server.ts"),
    import("./price.server.ts"),
    import("./flow.server.ts"),
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
    flow,
    owners: process.env.OWNER_WALLETS,
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
    const { minBalance } = ctx;
    if (!ctx.secret) return { status: "disabled", minBalance, ...ctx.reqInfo };

    const out = await ctx.flow.decideState(
      { secret: ctx.secret, host: ctx.host, minBalance, owners: ctx.owners, readBalance: ctx.readBalance },
      ctx.sessionCookie(),
    );
    if (out.kind === "signed_out") return { status: "signed_out", minBalance, ...ctx.reqInfo };
    if (out.kind === "not_holder") {
      ctx.writeSession(null);
      return { status: "not_holder", minBalance, ...ctx.reqInfo, address: out.address, balance: out.balance };
    }
    if (out.rewrite) ctx.writeSession(out.rewrite);
    return {
      status: "holder",
      minBalance,
      ...ctx.reqInfo,
      address: out.session.a,
      balance: out.balance,
      checkedAt: out.session.chk,
      expiresAt: out.session.exp,
      recheckFailed: out.recheckFailed || undefined,
      owner: out.owner || undefined,
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
    const { minBalance } = ctx;
    if (!ctx.secret) return { status: "disabled", minBalance, ...ctx.reqInfo };
    const out = await ctx.flow.decideSignIn(
      { secret: ctx.secret, host: ctx.host, minBalance, owners: ctx.owners, readBalance: ctx.readBalance },
      data?.nonceToken,
      data?.signature,
    );
    if (out.kind === "error") return { status: "error", error: out.error };
    if (out.kind === "not_holder") {
      ctx.writeSession(null);
      return { status: "not_holder", minBalance, ...ctx.reqInfo, address: out.address, balance: out.balance };
    }
    ctx.writeSession(out.session);
    return {
      status: "holder",
      minBalance,
      ...ctx.reqInfo,
      address: out.session.a,
      balance: out.balance,
      checkedAt: out.session.chk,
      expiresAt: out.session.exp,
      owner: out.owner || undefined,
    };
  });

export const signOutMembers = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await serverCtx();
  ctx.writeSession(null);
  return { ok: true };
});
