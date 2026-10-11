/** Minimal Bitcoin-alphabet base58 (what Solana uses for addresses and keys). */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const INDEX = new Map([...ALPHABET].map((c, i) => [c, i]));

export function base58Decode(input: string): Uint8Array | null {
  if (!input) return null;
  let zeros = 0;
  while (zeros < input.length && input[zeros] === "1") zeros++;
  const b256: number[] = []; // little-endian
  for (const ch of input) {
    const value = INDEX.get(ch);
    if (value === undefined) return null;
    let carry = value;
    for (let j = 0; j < b256.length; j++) {
      carry += b256[j] * 58;
      b256[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      b256.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(zeros + b256.length);
  for (let i = 0; i < b256.length; i++) out[zeros + i] = b256[b256.length - 1 - i];
  return out;
}

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = []; // little-endian base58
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let out = "1".repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i--) out += ALPHABET[digits[i]];
  return out;
}

/** A Solana public key is exactly 32 bytes once decoded. */
export function isSolanaAddress(address: unknown): address is string {
  if (typeof address !== "string" || address.length < 32 || address.length > 44) return false;
  return base58Decode(address)?.length === 32;
}
