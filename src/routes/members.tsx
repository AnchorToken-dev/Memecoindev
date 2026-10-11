import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Eye,
  KeyRound,
  LogOut,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { CopyButton } from "@/components/shell";
import {
  ANCHOR_MINT,
  ANCHOR_PUMP_URL,
  ANCHOR_SITE_URL,
  RUG_CHECK_URL,
  shortAddress,
  type MembersState,
} from "@/lib/members/config";
import {
  completeSignIn,
  getMembersState,
  requestSignInNonce,
  signOutMembers,
} from "@/lib/members/api";
import {
  hasInjectedSolanaWallet,
  isMobileUserAgent,
  walletBrowseLinks,
  type WalletLink,
} from "@/lib/members/mobile-wallets";

export const Route = createFileRoute("/members")({
  loader: () => getMembersState(),
  component: MembersPage,
  head: () => ({
    meta: [
      { title: "Members · MemecoinDev" },
      {
        name: "description",
        content:
          "Members area for $ANCHOR holders: launch watchlist, early access and holder tools.",
      },
    ],
  }),
});

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 ? 2 : 0,
  });

/** "$5 of $ANCHOR (about 1,162,791 tokens)" or "500,000 $ANCHOR". */
function requirementText(state: MembersState) {
  if (state.minUsd !== undefined && !state.priceFallback) {
    return `${usd(state.minUsd)} of $ANCHOR (about ${fmt(state.minBalance)} tokens)`;
  }
  return `${fmt(state.minBalance)} $ANCHOR`;
}

function MembersPage() {
  const state = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-8">
      {state.status === "holder" ? <Dashboard state={state} /> : <Gate state={state} />}
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest text-neon uppercase">{children}</p>;
}

function SeedPhraseNote() {
  return (
    <p className="flex items-start gap-2 border border-teal/50 bg-teal/10 px-4 py-3 text-sm text-fg">
      <KeyRound className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
      <span>
        <strong>We'll never ask for your seed phrase or private key.</strong> Signing in is one free
        message signature. It doesn't move funds or approve a transaction.
      </span>
    </p>
  );
}

const inside = [
  {
    icon: Eye,
    title: "Launch watchlist",
    text: "Coins I'm watching before they launch, posted here first.",
  },
  {
    icon: BookOpen,
    title: "Trade journal",
    text: "My notes on what worked and what didn't. Coming soon.",
  },
  {
    icon: Sparkles,
    title: "Early access",
    text: "New tools and Rug Check features before everyone else.",
  },
  {
    icon: ShieldCheck,
    title: "Rug Check",
    text: "Free A–F risk grades for any Solana or Robinhood chain CA.",
  },
  {
    icon: MessagesSquare,
    title: "Holder Discord",
    text: "A holders-only channel. The invite shows up here, never in a DM.",
  },
];

function Gate({ state }: { state: Exclude<MembersState, { status: "holder" }> }) {
  return (
    <>
      <div className="max-w-2xl">
        <Kicker>Access for $ANCHOR holders</Kicker>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-silver">Members</h1>
        <p className="mt-3 text-muted">
          A members area for people who hold $ANCHOR. Connect a Solana wallet holding at least{" "}
          <strong className="text-fg">{requirementText(state)}</strong> and sign one message to get
          in.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="border border-line bg-surface p-5 sm:p-6" aria-labelledby="inside">
          <h2 id="inside" className="font-display text-2xl tracking-wide text-fg">
            What's inside
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {inside.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-fg">{title}</p>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="flex flex-col gap-4 border border-teal/60 bg-surface p-5 sm:p-6"
          aria-labelledby="signin"
        >
          <h2 id="signin" className="font-display text-2xl tracking-wide text-fg">
            Holder sign-in
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-line bg-surface-2 p-3">
              <dt className="text-muted">Needed</dt>
              {state.minUsd !== undefined && !state.priceFallback ? (
                <>
                  <dd className="mt-1 font-display text-2xl tracking-wide text-neon">
                    {usd(state.minUsd)}
                  </dd>
                  <dd className="text-muted">≈ {fmt(state.minBalance)} $ANCHOR</dd>
                </>
              ) : (
                <>
                  <dd className="mt-1 font-display text-2xl tracking-wide text-neon">
                    {fmt(state.minBalance)}
                  </dd>
                  <dd className="text-muted">$ANCHOR</dd>
                </>
              )}
            </div>
            <div className="border border-line bg-surface-2 p-3">
              <dt className="text-muted">Checked</dt>
              <dd className="mt-1 text-fg">On-chain, at sign-in and while you're signed in</dd>
            </div>
          </dl>
          <PriceNote state={state} />

          {state.status === "not_holder" ? (
            <p
              className="border border-copper bg-copper/10 px-4 py-3 text-sm text-fg"
              role="status"
            >
              Wallet {shortAddress(state.address)} holds {state.balance} $ANCHOR. Members access
              needs {requirementText(state)}. You can connect a different wallet below.
            </p>
          ) : null}

          {state.status === "disabled" ? (
            <p
              className="border border-line bg-surface-2 px-4 py-3 text-sm text-muted"
              role="status"
            >
              Holder sign-in is still being set up. Check back soon.
            </p>
          ) : (
            <WalletSignIn />
          )}

          <SeedPhraseNote />

          <div className="border-t border-line pt-4 text-sm text-muted">
            <p>Official $ANCHOR links. Always check the contract address:</p>
            <p className="mt-2 break-all font-mono text-xs text-silver">{ANCHOR_MINT}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton value={ANCHOR_MINT} label="Copy CA" />
              <ExtLink href={ANCHOR_PUMP_URL}>pump.fun page</ExtLink>
              <ExtLink href={ANCHOR_SITE_URL}>anchortoken.vip</ExtLink>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PriceNote({ state }: { state: MembersState }) {
  if (state.minUsd === undefined) return null;
  return (
    <p className="text-xs text-muted">
      {state.priceFallback
        ? `The live $ANCHOR price isn't available right now, so the fixed ${fmt(state.minBalance)} $ANCHOR minimum applies.`
        : "Token amount uses the higher of the current $ANCHOR price and its price 24 hours ago (DexScreener or GeckoTerminal), refreshed about every 5 minutes, so short dips don't raise the bar."}
    </p>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center gap-1 border border-line bg-surface-2 px-4 text-sm font-semibold text-fg hover:border-teal"
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

type WalletsModule = typeof import("@/lib/members/wallets");
type DetectedWallet = ReturnType<WalletsModule["listSignInWallets"]>[number];

function WalletSignIn() {
  const router = useRouter();
  const [mod, setMod] = useState<WalletsModule | null>(null);
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mobileLinks, setMobileLinks] = useState<WalletLink[] | null>(null);

  // Phones without an injected wallet: offer to reopen this page inside a wallet
  // app's browser. Decide after a short delay, since wallets can register late.
  useEffect(() => {
    if (wallets.length > 0) {
      setMobileLinks(null);
      return;
    }
    const t = setTimeout(() => {
      if (!isMobileUserAgent(navigator.userAgent, navigator.maxTouchPoints)) return;
      if (hasInjectedSolanaWallet(window)) return;
      setMobileLinks(walletBrowseLinks(window.location.href, window.location.origin));
    }, 600);
    return () => clearTimeout(t);
  }, [wallets.length]);

  useEffect(() => {
    let off: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/members/wallets").then((m) => {
      if (cancelled) return;
      setMod(m);
      const refresh = () => setWallets(m.listSignInWallets());
      refresh();
      off = m.onWalletsChanged(refresh);
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  async function signIn(wallet: DetectedWallet) {
    if (!mod) return;
    setBusy(wallet.name);
    setError(null);
    setNotice(null);
    try {
      const account = await mod.connectWallet(wallet);
      const nonce = await requestSignInNonce({ data: { address: account.address } });
      if (!nonce.ok) throw new Error(nonce.error);
      const signature = await mod.signText(wallet, account, nonce.message);
      const result = await completeSignIn({ data: { nonceToken: nonce.nonceToken, signature } });
      if (result.status === "error") throw new Error(result.error);
      if (result.status === "not_holder") {
        setNotice(
          `Wallet ${shortAddress(result.address)} holds ${result.balance} $ANCHOR. Members access needs ${requirementText(result)}. You can try a different wallet.`,
        );
        return;
      }
      await router.invalidate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        /reject|denied|cancel/i.test(msg)
          ? "Sign-in was cancelled in the wallet."
          : msg || "Sign-in didn't go through. Try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (!mod) {
    return <p className="text-sm text-muted">Looking for Solana wallets…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {wallets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              type="button"
              disabled={busy !== null}
              onClick={() => signIn(w)}
              className="inline-flex min-h-11 items-center gap-2 border border-teal bg-teal px-4 text-sm font-semibold text-bg hover:bg-neon disabled:opacity-60"
            >
              {w.icon ? (
                <img src={w.icon} alt="" className="size-5" />
              ) : (
                <Wallet className="size-5" aria-hidden="true" />
              )}
              {busy === w.name ? "Check your wallet…" : `Sign in with ${w.name}`}
            </button>
          ))}
        </div>
      ) : mobileLinks ? (
        <div className="flex flex-col gap-2 text-sm text-muted" data-testid="open-in-wallet">
          <p>No wallet found in this browser. Open this page in your wallet app to sign in:</p>
          <a
            href={mobileLinks[0].href}
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#ab9ff2] px-4 text-sm font-semibold text-[#1c1c33] hover:opacity-90"
          >
            <Wallet className="size-5" aria-hidden="true" /> Open in Phantom
          </a>
          <div className="flex gap-2">
            {mobileLinks.slice(1).map((l) => (
              <a
                key={l.id}
                href={l.href}
                className="inline-flex min-h-10 flex-1 items-center justify-center border border-teal px-3 text-xs font-semibold text-fg hover:border-neon"
              >
                Open in {l.name}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted">
          <p>
            No Solana wallet found in this browser. Install{" "}
            <a
              className="text-teal underline"
              href="https://phantom.com"
              target="_blank"
              rel="noreferrer"
            >
              Phantom
            </a>
            ,{" "}
            <a
              className="text-teal underline"
              href="https://solflare.com"
              target="_blank"
              rel="noreferrer"
            >
              Solflare
            </a>{" "}
            or{" "}
            <a
              className="text-teal underline"
              href="https://backpack.app"
              target="_blank"
              rel="noreferrer"
            >
              Backpack
            </a>
            , then refresh.
          </p>
          <p className="mt-2">
            On a phone, open memecoindev.vip/members inside your wallet app's browser.
          </p>
        </div>
      )}
      {notice ? (
        <p className="border border-copper bg-copper/10 px-4 py-3 text-sm text-fg" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-copper" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  return now;
}

function hoursLeft(until: number, now: number) {
  const h = Math.max(0, Math.round((until - now) / 3_600_000));
  return h <= 1 ? "under an hour" : `about ${h} hours`;
}

function Dashboard({ state }: { state: Extract<MembersState, { status: "holder" }> }) {
  const router = useRouter();
  const now = useNow();
  return (
    <>
      <section className="border border-teal/60 bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Kicker>Access for $ANCHOR holders</Kicker>
            <h1 className="mt-2 font-display text-5xl tracking-wide text-silver">
              Welcome in, {shortAddress(state.address)}
            </h1>
            <p className="mt-3 max-w-xl text-muted">
              You're in the members area. This is the early version, so expect more here soon.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOutMembers();
              await router.invalidate();
            }}
            className="inline-flex min-h-11 items-center gap-2 self-start border border-line bg-surface-2 px-4 text-sm font-semibold text-fg hover:border-teal"
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <Stat label="Wallet holds" value={`${state.balance} $ANCHOR`} accent />
          <Stat label="Access needs" value={requirementText(state)} />
          <Stat
            label="Session"
            value={now ? `Ends in ${hoursLeft(state.expiresAt, now)}` : "Active"}
          />
        </dl>
        {state.recheckFailed ? (
          <p className="mt-3 text-sm text-muted">
            Couldn't re-check your balance just now. Using your last verified balance.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={Eye} kicker="Members" title="Launch watchlist">
          Coins I'm watching before launch will show up here first, with the CA and my notes.
          Nothing listed yet.
        </Card>
        <Card icon={BookOpen} kicker="Coming soon" title="Trade journal">
          My notes on what worked, what didn't, and why. Lessons, not calls.
        </Card>
        <Card icon={Sparkles} kicker="Early access" title="Try things first">
          New tools and Rug Check features land here before they go public. You'll see them in this
          section first.
        </Card>
        <a
          href={RUG_CHECK_URL}
          className="block border border-line bg-surface p-5 hover:border-teal"
        >
          <CardHead icon={ShieldCheck} kicker="Free tool" title="Rug Check" />
          <p className="mt-3 text-muted">
            Paste a CA, get an A–F risk grade before you trust a coin.
          </p>
          <p className="mt-4 text-sm font-semibold text-teal">rugcheck.memecoindev.vip →</p>
        </a>
        <Card icon={MessagesSquare} kicker="Placeholder" title="Holder Discord">
          A holders-only channel is on the way. The invite link will appear right here, never in a
          DM. If someone DMs you an invite, it's not me.
        </Card>
      </div>

      <SeedPhraseNote />
      <p className="text-sm text-muted">
        Access for holders only. Nothing here is financial advice.
      </p>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-line bg-surface-2 p-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`mt-1 font-semibold ${accent ? "text-neon" : "text-fg"}`}>{value}</dd>
    </div>
  );
}

function CardHead({
  icon: Icon,
  kicker,
  title,
}: {
  icon: typeof Eye;
  kicker: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-5 shrink-0 text-teal" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold tracking-widest text-neon uppercase">{kicker}</p>
        <h2 className="mt-1 font-display text-3xl tracking-wide text-fg">{title}</h2>
      </div>
    </div>
  );
}

function Card({
  icon,
  kicker,
  title,
  children,
}: {
  icon: typeof Eye;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-surface p-5">
      <CardHead icon={icon} kicker={kicker} title={title} />
      <p className="mt-3 text-muted">{children}</p>
    </section>
  );
}
