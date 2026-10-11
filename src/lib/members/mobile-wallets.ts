/**
 * Deep links that reopen the current page inside a wallet's in-app browser,
 * for mobile browsers (and the Android app WebView) with no injected wallet.
 */
export type WalletLink = { id: "phantom" | "solflare" | "backpack"; name: string; href: string };

export function walletBrowseLinks(currentUrl: string, origin: string): WalletLink[] {
  const url = encodeURIComponent(currentUrl);
  const ref = encodeURIComponent(origin);
  return [
    { id: "phantom", name: "Phantom", href: `https://phantom.app/ul/browse/${url}?ref=${ref}` },
    {
      id: "solflare",
      name: "Solflare",
      href: `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`,
    },
    {
      id: "backpack",
      name: "Backpack",
      href: `https://backpack.app/ul/v1/browse/${url}?ref=${ref}`,
    },
  ];
}

export function isMobileUserAgent(ua: string, maxTouchPoints = 0): boolean {
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  // iPadOS reports a desktop Safari UA
  return /Macintosh/.test(ua) && maxTouchPoints > 1;
}

/** True when a Solana wallet has injected itself into this page. */
export function hasInjectedSolanaWallet(w: unknown): boolean {
  const win = w as {
    phantom?: { solana?: unknown };
    solflare?: unknown;
    backpack?: unknown;
    solana?: unknown;
  };
  return Boolean(win?.phantom?.solana || win?.solflare || win?.backpack || win?.solana);
}
