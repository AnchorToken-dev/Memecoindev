import { createFileRoute } from "@tanstack/react-router";
import { pumpCoins } from "@/data/content";
import { CoinCard, SectionTitle, TelegramCallout } from "@/components/shell";

export const Route = createFileRoute("/pump")({
  component: PumpPage,
  head: () => ({
    meta: [{ title: "Pump.fun coins · MemecoinDev" }],
  }),
});

function PumpPage() {
  return (
    <div className="flex flex-col gap-10">
      <SectionTitle kicker="Solana" title="Pump.fun coins">
        Launched under MemecoinDev. No dev allocation, no pre-mine, no team wallet.
        If I buy, the buy is live on chain.
      </SectionTitle>
      <TelegramCallout />
      <div className="grid gap-4 lg:grid-cols-2">
        {pumpCoins.map((coin) => (
          <CoinCard key={coin.name} coin={coin} />
        ))}
      </div>
    </div>
  );
}
