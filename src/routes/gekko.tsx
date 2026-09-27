import { createFileRoute } from "@tanstack/react-router";
import { gekkoCoins } from "@/data/content";
import { CoinCard, SectionTitle, TelegramCallout } from "@/components/shell";

export const Route = createFileRoute("/gekko")({
  component: GekkoPage,
  head: () => ({
    meta: [{ title: "Gekko.cash coins · MemecoinDev" }],
  }),
});

function GekkoPage() {
  return (
    <div className="flex flex-col gap-10">
      <SectionTitle kicker="Robinhood chain" title="Gekko.cash coins">
        Same rules as Pump.fun. No dev allocation, no pre-mine, no team wallet.
        The team is me.
      </SectionTitle>
      <TelegramCallout />
      <div className="grid gap-4 lg:grid-cols-2">
        {gekkoCoins.map((coin) => (
          <CoinCard key={coin.name} coin={coin} />
        ))}
      </div>
    </div>
  );
}
