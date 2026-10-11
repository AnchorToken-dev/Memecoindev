/** Browser-only helpers for Wallet Standard wallets (Phantom, Solflare, Backpack, ...). */
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import {
  StandardConnect,
  type StandardConnectFeature,
} from "@wallet-standard/features";
import {
  SolanaSignMessage,
  type SolanaSignMessageFeature,
} from "@solana/wallet-standard-features";

export type SignInWallet = Wallet & {
  features: StandardConnectFeature & SolanaSignMessageFeature;
};

export function isSignInWallet(wallet: Wallet): wallet is SignInWallet {
  return (
    StandardConnect in wallet.features &&
    SolanaSignMessage in wallet.features &&
    wallet.chains.some((c) => c.startsWith("solana:"))
  );
}

export function listSignInWallets(): SignInWallet[] {
  return getWallets().get().filter(isSignInWallet);
}

export function onWalletsChanged(cb: () => void): () => void {
  const api = getWallets();
  const offRegister = api.on("register", cb);
  const offUnregister = api.on("unregister", cb);
  return () => {
    offRegister();
    offUnregister();
  };
}

export async function connectWallet(wallet: SignInWallet): Promise<WalletAccount> {
  const { accounts } = await wallet.features[StandardConnect].connect();
  const account = accounts.find((a) => a.chains.some((c) => c.startsWith("solana:"))) ?? accounts[0];
  if (!account) throw new Error("No Solana account was shared by the wallet.");
  return account;
}

/** Asks the wallet to sign plain text. Returns the signature as base64. */
export async function signText(
  wallet: SignInWallet,
  account: WalletAccount,
  text: string,
): Promise<string> {
  const [result] = await wallet.features[SolanaSignMessage].signMessage({
    account,
    message: new TextEncoder().encode(text),
  });
  if (!result?.signature) throw new Error("The wallet did not return a signature.");
  let bin = "";
  for (const b of result.signature) bin += String.fromCharCode(b);
  return btoa(bin);
}
