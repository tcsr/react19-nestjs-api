/**
 * CRYPTO (node:crypto)
 * --------------------
 * Built-in cryptography. Key uses:
 *  - HASH (one-way): SHA-256 for integrity/fingerprints. NOT for passwords.
 *  - PASSWORD HASHING: use a slow KDF (scrypt/bcrypt/argon2) with a salt — never
 *    plain SHA. Below uses scrypt (built in).
 *  - HMAC: keyed hash for signatures/webhook verification.
 *  - SYMMETRIC ENCRYPTION: AES-256-GCM (authenticated) with a random IV.
 *  - RANDOM: randomBytes / randomUUID for tokens/ids (cryptographically secure).
 *
 * Run: npx tsx src/topics/node/09-crypto.ts
 */

import {
  createHash,
  createHmac,
  scryptSync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';

// Hash (integrity)
console.log('sha256:', createHash('sha256').update('hello').digest('hex').slice(0, 16), '…');

// Password hashing with salt (scrypt). Store salt + hash together.
function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyPassword(pw: string, stored: string) {
  const [saltHex, hashHex] = stored.split(':');
  const hash = scryptSync(pw, Buffer.from(saltHex, 'hex'), 64);
  // Constant-time compare avoids timing attacks.
  return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}
const stored = hashPassword('s3cret');
console.log('password ok:', verifyPassword('s3cret', stored), '| wrong:', verifyPassword('nope', stored));

// HMAC (signature)
console.log('hmac:', createHmac('sha256', 'key').update('payload').digest('hex').slice(0, 16), '…');

// Tokens / ids
console.log('token:', randomBytes(16).toString('hex'));
console.log('uuid :', randomUUID());

// AES-256-GCM encrypt/decrypt
const key = randomBytes(32);
const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([cipher.update('top secret', 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
console.log('decrypted:', dec);
