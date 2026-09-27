import { createFileRoute, Link } from "@tanstack/react-router";
import {
  gekkoCoins,
  interests,
  profile,
  pumpCoins,
  rules,
  wallets,
} from "@/data/content";
import {
  Kicker,
  OutLink,
  SectionTitle,
  TelegramCallout,
  WalletList,
} from "@/components/shell";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "MemecoinDev · Official site" }],
  }),
});

function Home() {
  return (
    <div className="flex flex-col gap-14">
      <section className="grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <figure>
          <img
            src="/mark.jpg"
            alt="Mark, MemecoinDev"
            className="aspect-square w-full border border-line object-cover"
            width={512}
            height={512}
          />
          <figcaption className="mt-3 text-sm text-muted">
            {profile.name} · {profile.age} · {profile.place}
          </figcaption>
        </figure>
        <div>
          <Kicker>Official dev account</Kicker>
          <h1 className="mt-2 font-display text-6xl tracking-wide text-fg">
            {profile.handle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-fg">
            I build coin projects because I am sick of being rugged.
          </p>
          <p className="mt-3 max-w-xl text-muted">
            My name is {profile.name}. I am {profile.age}, from {profile.place}.
            Gamer, computer technician, car enthusiast, crypto lover, trader, 2A
            enthusiast, and a Cleveland sports fan.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {rules.map((rule) => (
              <li
                key={rule.title}
                className="border border-line bg-surface px-3 py-2 text-sm font-semibold text-fg"
              >
                {rule.title}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.x.map((account) => (
              <OutLink key={account.handle} href={account.href}>
                @{account.handle}
              </OutLink>
            ))}
            <OutLink href={profile.discord}>Discord</OutLink>
          </div>
        </div>
      </section>

      <TelegramCallout />

      <section>
        <SectionTitle kicker="The rules" title="How these coins are launched">
          No hidden bag. If I buy, it is a public on-chain buy after the coin is live.
        </SectionTitle>
        <ol className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
          {rules.map((rule, index) => (
            <li key={rule.title} className="bg-surface p-5">
              <p className="font-display text-xl tracking-wide text-gold">
                0{index + 1}
              </p>
              <h3 className="mt-2 font-display text-2xl tracking-wide">{rule.title}</h3>
              <p className="mt-2 text-muted">{rule.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle kicker="Work with me" title="X, Discord, or email">
          That is the whole list. Collaborations go to the inbox below.
        </SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {profile.x.map((account) => (
            <a
              key={account.handle}
              href={account.href}
              target="_blank"
              rel="noreferrer"
              className="border border-line bg-surface p-5 hover:border-gold"
            >
              <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                X
              </p>
              <p className="mt-2 font-display text-2xl tracking-wide">@{account.handle}</p>
            </a>
          ))}
          <a
            href={profile.discord}
            target="_blank"
            rel="noreferrer"
            className="border border-line bg-surface p-5 hover:border-gold"
          >
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              Discord
            </p>
            <p className="mt-2 font-display text-2xl tracking-wide">Join the server</p>
          </a>
        </div>
        <p className="mt-4 text-muted">
          Email{" "}
          <a className="font-semibold text-gold hover:text-fg" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {interests.map((item) => (
            <li key={item} className="bg-surface-2 px-3 py-2 text-sm text-fg">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle kicker="Projects" title="Where the coins live">
          Two launchpads. Every contract on those pages is one I am willing to put my name on.
        </SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link to="/pump" className="border border-line bg-surface p-5 hover:border-gold">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              Solana
            </p>
            <h3 className="mt-2 font-display text-4xl tracking-wide">Pump.fun</h3>
            <p className="mt-3 text-muted">
              {pumpCoins.map((coin) => coin.name).join(" · ")}
            </p>
          </Link>
          <Link to="/gekko" className="border border-line bg-surface p-5 hover:border-gold">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              Robinhood chain
            </p>
            <h3 className="mt-2 font-display text-4xl tracking-wide">Gekko.cash</h3>
            <p className="mt-3 text-muted">
              {gekkoCoins.map((coin) => coin.name).join(" · ")}
            </p>
          </Link>
        </div>
      </section>

      <section id="wallets">
        <SectionTitle kicker="Wallets" title="Addresses I actually use">
          Match these before you send anything. A similar address in a reply is not me.
        </SectionTitle>
        <div className="mt-6">
          <WalletList groups={wallets} />
        </div>
      </section>
    </div>
  );
}
