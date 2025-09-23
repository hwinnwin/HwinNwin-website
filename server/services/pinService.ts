import bcrypt from 'bcrypt';

/**
 * PIN hashing and comparison utilities using bcrypt for secure storage
 */

const SALT_ROUNDS = 12; // High security - computationally intensive

/**
 * Hash a PIN using bcrypt with salt for secure storage
 * @param plainPin - The plaintext PIN to hash
 * @returns Promise<string> - The hashed PIN
 */
export async function hashPin(plainPin: string): Promise<string> {
  return await bcrypt.hash(plainPin, SALT_ROUNDS);
}

/**
 * Compare a plaintext PIN with a hashed PIN using constant-time comparison
 * This prevents timing attacks by always taking the same amount of time
 * @param plainPin - The plaintext PIN to verify
 * @param hashedPin - The hashed PIN from storage
 * @returns Promise<boolean> - True if PIN matches, false otherwise
 */
export async function comparePin(plainPin: string, hashedPin: string): Promise<boolean> {
  return await bcrypt.compare(plainPin, hashedPin);
}

/**
 * Check if a PIN is already hashed (bcrypt hashes start with $2b$)
 * @param pin - The PIN to check
 * @returns boolean - True if the PIN appears to be hashed
 */
export function isPinHashed(pin: string): boolean {
  return pin.startsWith('$2b$') || pin.startsWith('$2a$') || pin.startsWith('$2y$');
}