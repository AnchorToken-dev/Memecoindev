import { createFileRoute, Link } from "@tanstack/react-router";
import { EmailLink, LegalPage, LegalSection, OtherPolicy, linkClass } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: "Privacy Policy · MemecoinDev" }],
  }),
});

function PrivacyPage() {
  return (
    <LegalPage
      kicker="What this site handles"
      title="Privacy Policy"
      lede="What memecoindev.vip actually collects, written from how the site is built. Linked sites have their own rules."
    >
      <LegalSection title="This policy covers this site">
        <p>
          This policy is for memecoindev.vip, run by Mark Burnett II (MemecoinDev) in Woodstock,
          Georgia, USA. It does not cover X, Discord, Pump.fun, Gekko.cash, wallet apps, Rug Check
          (rugcheck.memecoindev.vip), Anchor Desk (desk.memecoindev.vip),{" "}
          <a className={linkClass} href="https://anchortoken.vip" target="_blank" rel="noreferrer">
            anchortoken.vip
          </a>
          , or other sites I link to. When you leave this site, their policies apply.
        </p>
      </LegalSection>

      <LegalSection title="What I don't collect">
        <p>
          There is no account signup on this site, and there is no contact form. Browsing the public
          pages does not ask for your name, email, or wallet.
        </p>
        <p>
          The site code does not include an analytics product. There is no Google Analytics,
          Plausible, PostHog, or similar tracker, and the site does not set advertising cookies.
        </p>
        <p>
          The wallet addresses printed on the home page are mine. Copying one uses your browser's
          clipboard on your device. That copy is not sent to my server.
        </p>
      </LegalSection>

      <LegalSection title="If you email me">
        <p>
          Email links open your own mail app to <EmailLink />. The website does not receive that
          message through a form, and it does not store a mailing list.
        </p>
        <p>
          If you send an email, I get what you chose to include: your address, what you wrote, and
          any attachment. I use it to read the message and reply. I do not sell personal data, and I
          do not share your email with advertisers or add you to a newsletter because you wrote in.
        </p>
      </LegalSection>

      <LegalSection title="Fonts, hosting, and the Grok mark">
        <p>
          The site is hosted on Vercel. Delivering a page means the host sees ordinary request data,
          such as IP address, browser type, the URL you asked for, and the time. I don't add a
          separate analytics tool on top of that, and I don't sell those logs.
        </p>
        <p>
          Pages load the Oswald and Source Sans 3 fonts from Google (fonts.googleapis.com and
          fonts.gstatic.com). Your browser sends Google the usual request data, including your IP
          address, so those font files can download.
        </p>
        <p>
          The deployed pages also load a script from grok.com
          (grok.com/grok-app-builder/extensions.js). The hosting setup adds it for the "Created with
          Grok" mark. Your browser requests that file from grok.com. I don't use that script as an
          analytics product for this site.
        </p>
      </LegalSection>

      <LegalSection title="Wallets on the members page">
        <p>
          The only place this site asks for a wallet is{" "}
          <Link to="/members" className={linkClass}>
            /members
          </Link>
          , and only if you choose to sign in. You connect a Solana wallet in your browser, or you
          open the page inside a wallet app such as Phantom, Solflare, or Backpack.
        </p>
        <p>
          Your wallet address, and a signature of a sign-in message, are sent to this site's server.
          The message says the signature proves you control that wallet. It does not move funds,
          approve a spend, or ask for a seed phrase or private key. I never receive your seed phrase
          or private key through this site.
        </p>
        <p>
          The server checks the signature, then asks a Solana RPC for that wallet's $ANCHOR balance.
          If a private RPC URL is configured on the deployment, that endpoint is used. Otherwise the
          public mainnet RPC at api.mainnet-beta.solana.com is used. The lookup is your wallet
          address and the token mint, so that RPC provider sees it.
        </p>
        <p>
          While you stay signed in, the server re-reads that balance from Solana about once an hour,
          until the session ends (at most 24 hours). If you try to sign in and don't hold enough,
          the balance check still happens. No members cookie is saved in that case.
        </p>
        <p>
          If the members gate is set as a dollar amount, the server also asks DexScreener for the
          public $ANCHOR price, and GeckoTerminal if DexScreener doesn't answer. That call uses the
          token's public mint address. It is not tied to your email. If the gate is a token count
          only, that price lookup is skipped.
        </p>
        <p>Your wallet app is a separate company. What it stores is covered by its own policy.</p>
      </LegalSection>

      <LegalSection title="The one site cookie">
        <p>
          Public pages do not set a cookie for you. After a successful members sign-in, the site
          sets one first-party cookie named <span className="font-mono text-fg">mcd_members</span>.
          It is HttpOnly, Secure, and SameSite=Lax. It lasts up to 24 hours, or until you press Sign
          out, which clears it.
        </p>
        <p>
          The cookie holds a signed record of the wallet address, the last balance check, and when
          the session ends. It is not an account in a user database. This site does not keep a
          separate profile of members. There is no marketing cookie and no analytics cookie.
        </p>
        <p>
          A short-lived sign-in challenge (about five minutes) is used only to finish that sign-in.
          It is not kept as a profile.
        </p>
      </LegalSection>

      <LegalSection title="How long I keep things">
        <p>
          Emails stay in that inbox while I need them to handle the conversation. The members
          session stays in the cookie on your browser and expires within 24 hours, or sooner if you
          sign out. I don't keep a second copy of that session in a database on this site.
        </p>
        <p>
          Vercel, Google Fonts, grok.com, a Solana RPC, DexScreener, and GeckoTerminal may keep
          their own logs under their own policies. I don't control those.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          I use reasonable care. The members cookie is signed so it can't be forged by editing it,
          sign-in checks the wallet signature before the site trusts an address, and server secrets
          stay on the server. No website can promise perfect security.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          This site is not directed at children under 13. I don't knowingly collect personal
          information from them. If you believe a child emailed me, write to <EmailLink /> and I
          will delete that message.
        </p>
      </LegalSection>

      <LegalSection title="Ask me to delete an email">
        <p>
          Email <EmailLink /> to ask what I still have from you, or to ask me to delete emails you
          sent. I will delete the messages I still have from you, unless I have to keep something
          the law requires.
        </p>
        <p>
          To drop a members session, use Sign out on the members page, or clear cookies for this
          site in your browser. There is no separate account to close.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          I can update this policy by posting the new version on this page and changing the
          effective date. If you keep using the site after that, you are accepting the update.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Privacy questions and deletion requests go to <EmailLink />.
        </p>
        <OtherPolicy to="/terms" label="Terms of Use" />
        <p className="text-sm">
          <Link to="/" className={linkClass}>
            Back to the site
          </Link>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
