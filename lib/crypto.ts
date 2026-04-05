/**
 * SHA-256 hashing for access code verification.
 * The plaintext code is NEVER logged or stored — only hashes are compared.
 */

export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify user input against a known hash.
 * Used on the client to avoid embedding the plaintext access code.
 */
export async function verifyCode(
  input: string,
  validCodePlaintext: string,
): Promise<boolean> {
  const inputHash = await sha256(input);
  const validHash = await sha256(validCodePlaintext);
  return inputHash === validHash;
}
