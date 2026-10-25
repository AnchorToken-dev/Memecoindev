import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, Kicker } from "@/components/shell";

export const LEGAL_EFFECTIVE = "October 25, 2026";

export const linkClass = "text-teal underline decoration-teal/40 underline-offset-2 hover:text-fg";

export function EmailLink() {
  return (
    <a className={`${linkClass} break-all`} href={`mailto:${CONTACT_EMAIL}`}>
      {CONTACT_EMAIL}
    </a>
  );
}

export function LegalPage({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header>
        <Kicker>{kicker}</Kicker>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-fg">{title}</h1>
        <p className="mt-4 text-muted">{lede}</p>
        <p className="mt-3 text-sm text-muted">
          Effective {LEGAL_EFFECTIVE}. Operated by Mark Burnett II (MemecoinDev), Woodstock,
          Georgia, USA.
        </p>
      </header>
      {children}
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="font-display text-2xl tracking-wide text-fg">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-muted">{children}</div>
    </section>
  );
}

export function OtherPolicy({ to, label }: { to: "/terms" | "/privacy"; label: string }) {
  return (
    <p className="text-sm text-muted">
      Also see the{" "}
      <Link to={to} className={linkClass}>
        {label}
      </Link>
      .
    </p>
  );
}
