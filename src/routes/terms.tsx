import { createFileRoute, Link } from "@tanstack/react-router";
import { profile } from "@/data/content";
import { EmailLink, LegalPage, LegalSection, OtherPolicy, linkClass } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [{ title: "Terms of Use · MemecoinDev" }],
  }),
});

function TermsPage() {
  return (
    <LegalPage
      kicker="The rules of the site"
      title="Terms of Use"
      lede="Plain terms for using memecoindev.vip. This is a personal site. It is not a bank, an exchange, or an advice desk."
    >
      <LegalSection title="Using the site means you agree">
        <p>
          If you browse, copy an address, open a link, or sign in on the members page, you are
          agreeing to these terms. If you do not agree, don't use the site.
        </p>
      </LegalSection>

      <LegalSection title="What this site is">
        <p>
          I publish information about coins I launch, wallet addresses I use, and where I actually
          talk. That material is informational and educational. It is not financial advice,
          investment advice, tax advice, or legal advice.
        </p>
        <p>
          I am not your broker, advisor, or fiduciary. Nothing here is an offer to sell you a
          security, and nothing here is a solicitation to buy one. You decide what to do with your
          own money.
        </p>
      </LegalSection>

      <LegalSection title="Crypto can go to zero">
        <p>
          Crypto is risky. Prices move fast. You can lose some or all of the money you put in. A
          coin can fail, a launchpad can change its rules, and a link can go stale.
        </p>
        <p>
          I do not guarantee a price, a listing, a profit, an airdrop, or that any project will keep
          going. Past posts and past launches do not promise future results.
        </p>
      </LegalSection>

      <LegalSection title="Where I actually am">
        <p>
          The official places are this website, my X accounts (
          <a className={linkClass} href={profile.x[0].href} target="_blank" rel="noreferrer">
            @{profile.x[0].handle}
          </a>{" "}
          and{" "}
          <a className={linkClass} href={profile.x[1].href} target="_blank" rel="noreferrer">
            @{profile.x[1].handle}
          </a>
          ), and{" "}
          <a className={linkClass} href={profile.discord} target="_blank" rel="noreferrer">
            Discord
          </a>
          . That is the list.
        </p>
        <p>
          Telegram is not an official channel. I am not affiliated with Telegram. Anyone on Telegram
          claiming to be me, my admin, or support for these coins is an impersonator. Ignore them.
          Do not send them money, seed phrases, or wallet access.
        </p>
        <p>
          Contract addresses, coin links, and wallet addresses are official only when they are
          published on this site, or on an official page this site links to, such as{" "}
          <a className={linkClass} href="https://anchortoken.vip" target="_blank" rel="noreferrer">
            anchortoken.vip
          </a>
          . If it is not linked here, it is not me. A copied name in a DM, a lookalike site, or a
          Telegram group does not count.
        </p>
      </LegalSection>

      <LegalSection title="How to behave here">
        <p>Don't use the site in a way that harms it or other people. That includes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Breaking into the site, probing it, or overloading it.</li>
          <li>
            Scraping or automated access that degrades the service, including hammering the members
            sign-in or trying to skip the holder check.
          </li>
          <li>
            Impersonating me, MemecoinDev, or any coin I publish, including with my name, photo, or
            branding.
          </li>
          <li>Using the site to commit fraud, phishing, or any other crime.</li>
          <li>Trying to steal someone's wallet, keys, or login.</li>
        </ul>
        <p>I can block or stop access when someone does this.</p>
      </LegalSection>

      <LegalSection title="What I own">
        <p>
          The writing, the layout, and the photo of me on this site are mine unless I mark something
          otherwise. You can quote a short passage and link back to the page. You can't copy the
          site and present it as yours.
        </p>
        <p>
          You can't use my name, photo, or the MemecoinDev name to pretend you are me. Names of
          other products — Pump.fun, Gekko, wallet apps, and the rest — belong to their owners. I am
          not those companies.
        </p>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          The site is provided as is and as available. To the fullest extent allowed by law, I
          disclaim warranties of any kind, including warranties that the site will be accurate,
          complete, available, safe, or fit for a particular purpose.
        </p>
        <p>
          Addresses and links can change. Check this site again before you trust an old screenshot.
        </p>
      </LegalSection>

      <LegalSection title="Limit on my liability">
        <p>
          To the fullest extent allowed by law, I am not liable for any loss or damage connected to
          this site. That includes lost money, lost tokens, lost profits, trading losses, data loss,
          and downtime, whether I was told the risk was possible or not.
        </p>
        <p>
          If a law does not allow a limit like that, the limit applies as far as that law allows.
          Nothing here limits liability that the law says cannot be limited.
        </p>
      </LegalSection>

      <LegalSection title="Other people's services">
        <p>
          This site links out. Those links include X, Discord, Pump.fun, Gekko.cash, block
          explorers, wallet apps, Rug Check, Anchor Desk,{" "}
          <a className={linkClass} href="https://anchortoken.vip" target="_blank" rel="noreferrer">
            anchortoken.vip
          </a>
          , and anything else I point to. I am not liable for third-party sites, wallets, exchanges,
          or launchpads.
        </p>
        <p>
          They have their own rules, fees, and failures. Connecting a wallet, trading, or signing a
          transaction happens under their terms, not mine. I don't control them, and I don't control
          Telegram.
        </p>
      </LegalSection>

      <LegalSection title="I can change this">
        <p>
          I can change the site, remove pages, or replace these terms. The new terms go on this page
          with a new effective date. If you keep using the site after that, you are accepting the
          updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Georgia law">
        <p>
          These terms are governed by the laws of the State of Georgia, USA. Georgia law applies to
          disputes that come out of the site or these terms.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Email <EmailLink />. That inbox is how you reach me about these terms.
        </p>
        <OtherPolicy to="/privacy" label="Privacy Policy" />
        <p className="text-sm">
          <Link to="/" className={linkClass}>
            Back to the site
          </Link>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
