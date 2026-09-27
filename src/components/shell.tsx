import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Copy, ShieldAlert } from "lucide-react";
import type { Coin, WalletGroup } from "@/data/content";
import { profile } from "@/data/content";

const nav = [
  { to: "/", label: "Home" },
  { to: "/pump", label: "Pump.fun" },
  { to: "/gekko", label: "Gekko.cash" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="group flex items-baseline gap-3">
              <span className="font-display text-2xl tracking-wide text-fg">
                MEMECOINDEV
              </span>
              <span className="hidden text-sm text-muted sm:inline">
                {profile.name} · Georgia
              </span>
            </Link>
            <a
              href={`mailto:${profile.email}`}
              className="text-sm font-semibold text-gold hover:text-fg"
            >
              Email
            </a>
          </div>
          <nav className="flex gap-2" aria-label="Pages">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    "inline-flex min-h-11 items-center border border-gold bg-gold px-4 text-sm font-semibold text-gold-ink",
                }}
                inactiveProps={{
                  className:
                    "inline-flex min-h-11 items-center border border-line bg-surface px-4 text-sm font-semibold text-fg hover:border-gold",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>If it is not linked on this site, it is not me.</p>
          <p>X and Discord only. Telegram is a scammer.</p>
        </div>
      </footer>
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-gold uppercase">
      {children}
    </p>
  );
}

export function SectionTitle({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <Kicker>{kicker}</Kicker>
      <h2 className="mt-2 font-display text-4xl tracking-wide text-fg">{title}</h2>
      {children ? <p className="mt-3 text-muted">{children}</p> : null}
    </div>
  );
}

export function TelegramCallout() {
  return (
    <aside className="border border-copper bg-surface px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-copper" aria-hidden="true" />
        <div>
          <h2 className="font-display text-2xl tracking-wide text-fg">
            Telegram is not me
          </h2>
          <p className="mt-2 text-muted">
            I am moving completely off Telegram. Scammers impersonate projects
            there, and Telegram has refused to help protect the groups. Anyone
            claiming to be me on Telegram is a scammer. I talk on X and Discord.
            Check this site or those accounts before you trust a message.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 border border-line bg-surface-2 px-4 text-sm font-semibold text-fg hover:border-gold"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? (
        <Check className="size-4 text-gold" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

export function OutLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center gap-2 bg-gold px-4 text-sm font-semibold text-gold-ink hover:bg-fg"
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

export function CoinCard({ coin }: { coin: Coin }) {
  return (
    <article className="flex flex-col border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-widest uppercase">
        <span className="text-gold">{coin.venue}</span>
        <span className="text-muted">{coin.chain}</span>
      </div>
      <h2 className="mt-4 font-display text-3xl tracking-wide text-fg">{coin.name}</h2>
      {coin.ticker ? <p className="mt-1 font-semibold text-gold">{coin.ticker}</p> : null}
      {coin.note ? <p className="mt-3 text-sm text-muted">{coin.note}</p> : null}
      {coin.address ? (
        <p className="mt-4 font-mono text-sm break-all text-fg">{coin.address}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {coin.href ? <OutLink href={coin.href}>{coin.action}</OutLink> : null}
        {coin.address ? <CopyButton value={coin.address} label="Copy address" /> : null}
      </div>
    </article>
  );
}

export function WalletList({ groups }: { groups: WalletGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.name} className="border border-line bg-surface">
          <header className="border-b border-line px-5 py-4">
            <h3 className="font-display text-2xl tracking-wide">{group.name}</h3>
            {group.detail ? <p className="mt-1 text-sm text-muted">{group.detail}</p> : null}
          </header>
          <ul>
            {group.lines.map((line) => (
              <li
                key={`${group.name}-${line.chain}-${line.address}`}
                className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                    {line.chain}
                  </p>
                  <p className="mt-1 font-mono text-sm break-all text-fg">{line.address}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyButton value={line.address} />
                  {line.explorer ? (
                    <a
                      href={line.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold text-fg hover:border-gold"
                    >
                      Explorer
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
