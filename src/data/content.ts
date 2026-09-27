export const profile = {
  handle: "MemecoinDev",
  name: "Mark",
  age: 41,
  place: "Georgia, USA",
  email: "memecoindev42@gmail.com",
  discord: "https://discord.gg/cx8UTEzv",
  x: [
    { handle: "Draco4226", href: "https://x.com/Draco4226" },
    { handle: "Memecoindev46", href: "https://x.com/Memecoindev46" },
  ],
} as const;

export const interests = [
  "Gamer",
  "Computer technician",
  "Car enthusiast",
  "Crypto lover",
  "Trader",
  "2A enthusiast",
  "Cleveland sports",
] as const;

export const rules = [
  {
    title: "No dev allocation",
    body: "I do not take a developer share of the supply.",
  },
  {
    title: "No pre-mine",
    body: "Nothing is set aside before the coin is live.",
  },
  {
    title: "No team allocation",
    body: "There is no team wallet. The team is me.",
  },
  {
    title: "Buys are on-chain",
    body: "If I take any of a coin, that buy is live on chain where anyone can see it.",
  },
] as const;

export type Coin = {
  name: string;
  ticker?: string;
  href?: string;
  address?: string;
  chain: string;
  venue: string;
  action: string;
  note?: string;
};

export const pumpCoins: Coin[] = [
  {
    name: "AnchorToken",
    href: "https://pump.fun/coin/3jhApg98ukHe2EZFDsZ92J2KhMuMY5CW3NpCdt5spump",
    address: "3jhApg98ukHe2EZFDsZ92J2KhMuMY5CW3NpCdt5spump",
    chain: "Solana",
    venue: "Pump.fun",
    action: "Open on Pump.fun",
  },
  {
    name: "CardinalTakeover",
    href: "https://pump.fun/coin/G46CBrcmCVmHuRwVa9KThGD1twdxxpYC2TPBVLg7pump",
    address: "G46CBrcmCVmHuRwVa9KThGD1twdxxpYC2TPBVLg7pump",
    chain: "Solana",
    venue: "Pump.fun",
    action: "Open on Pump.fun",
  },
  {
    name: "Guardians",
    href: "https://join.pump.fun/HSag/vkbmm9xh",
    chain: "Solana",
    venue: "Pump.fun",
    action: "Open join link",
    note: "Community join link. This is not the Gekko Guardians coin.",
  },
];

export const gekkoCoins: Coin[] = [
  {
    name: "Guardians",
    ticker: "$CHAMPS",
    href: "https://www.gekko.cash/coin/0x56c3fb3ab57ba2f6f69ab32cf5c1903ab300351f",
    address: "0x56c3fb3ab57ba2f6f69ab32cf5c1903ab300351f",
    chain: "Robinhood chain",
    venue: "Gekko.cash",
    action: "Open on Gekko",
    note: "Separate from the Pump.fun Guardians join link.",
  },
  {
    name: "NoRugs",
    ticker: "$NORUGS",
    href: "https://www.gekko.cash/coin/0x7968f18863a24f0359851ac950e429de14546c18",
    address: "0x7968f18863a24f0359851ac950e429de14546c18",
    chain: "Robinhood chain",
    venue: "Gekko.cash",
    action: "Open on Gekko",
  },
  {
    name: "Cockroach Janta Party",
    ticker: "$ROACH",
    href: "https://www.gekko.cash/coin/0xe5c6bdaf6408b505aab1b65e9618a770a3b3c13a",
    address: "0xe5c6bdaf6408b505aab1b65e9618a770a3b3c13a",
    chain: "Robinhood chain",
    venue: "Gekko.cash",
    action: "Open on Gekko",
  },
  {
    name: "TheHinge",
    ticker: "$HINGE",
    href: "https://www.gekko.cash/coin/0x59fe54f9564285e33d0dd41d75c68ddc10e2e868",
    address: "0x59fe54f9564285e33d0dd41d75c68ddc10e2e868",
    chain: "Robinhood chain",
    venue: "Gekko.cash",
    action: "Open on Gekko",
  },
  {
    name: "Remember November / Polar Bear 2",
    ticker: "$REMEMBER",
    href: "https://www.gekko.cash/coin/0x8fbcf27a9da9ac2089b29260e65b2a7bf1bd203a",
    address: "0x8fbcf27a9da9ac2089b29260e65b2a7bf1bd203a",
    chain: "Robinhood chain",
    venue: "Gekko.cash",
    action: "Open on Gekko",
  },
];

export type WalletLine = {
  chain: string;
  address: string;
  explorer?: string;
};

export type WalletGroup = {
  name: string;
  detail?: string;
  lines: WalletLine[];
};

const solscan = (address: string) => `https://solscan.io/account/${address}`;
const etherscan = (address: string) => `https://etherscan.io/address/${address}`;

export const wallets: WalletGroup[] = [
  {
    name: "Phantom",
    lines: [
      {
        chain: "SOL",
        address: "5LMbeHMUNGtpoy8cduZQ8rLNVuDWLj7iGXUsYQgdaztr",
        explorer: solscan("5LMbeHMUNGtpoy8cduZQ8rLNVuDWLj7iGXUsYQgdaztr"),
      },
    ],
  },
  {
    name: "Trust Wallet",
    lines: [
      {
        chain: "SOL",
        address: "HGdJzcJ9TBwZRNMdfFXmy1d7ZJ3v1181nsHY6D5DKZHa",
        explorer: solscan("HGdJzcJ9TBwZRNMdfFXmy1d7ZJ3v1181nsHY6D5DKZHa"),
      },
      {
        chain: "ETH",
        address: "0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3",
        explorer: etherscan("0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3"),
      },
    ],
  },
  {
    name: "Robinhood",
    detail: "Same address as the Gekko.cash account.",
    lines: [
      {
        chain: "EVM",
        address: "0x4743Ff4b528A1861e26f4d6016b3EFB72e8C6Df3",
      },
    ],
  },
  {
    name: "Pump.fun · Draco4226",
    lines: [
      {
        chain: "SOL",
        address: "CzV52d371a6VRCkfV7jdPNtT5Tdkpty4Yn1pskCdk4Ki",
        explorer: solscan("CzV52d371a6VRCkfV7jdPNtT5Tdkpty4Yn1pskCdk4Ki"),
      },
      {
        chain: "EVM",
        address: "0x0f2F12CA9214d639B26Ca0cECD5251AFD2f3d267",
      },
    ],
  },
  {
    name: "Pump.fun · Memecoindev42",
    lines: [
      {
        chain: "SOL",
        address: "CSxUFh1b9NZF791v5SnqUJCrNjZ5U9cMB5SD1MbTx9mT",
        explorer: solscan("CSxUFh1b9NZF791v5SnqUJCrNjZ5U9cMB5SD1MbTx9mT"),
      },
      {
        chain: "EVM",
        address: "0x8817fa56f077a041B8D94C258a9D7B33aACAc79a",
      },
    ],
  },
];
