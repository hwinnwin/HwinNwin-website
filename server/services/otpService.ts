import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

/**
 * OTP (One-Time Password) generation and verification utilities
 * Secure 6-digit OTP with 5-minute expiry and single-use capability
 */

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const SALT_ROUNDS = 10; // Slightly lower than PIN for performance

/**
 * Generate a random 6-digit OTP code
 * @returns string - The 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate a random 6-digit number (100000 to 999999)
  const otp = randomInt(100000, 1000000);
  return otp.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Hash an OTP for secure storage
 * @param otp - The plaintext OTP to hash
 * @returns Promise<string> - The hashed OTP
 */
export async function hashOTP(otp: string): Promise<string> {
  return await bcrypt.hash(otp, SALT_ROUNDS);
}

/**
 * Verify an OTP against its hash using constant-time comparison
 * @param plainOtp - The plaintext OTP to verify
 * @param hashedOtp - The hashed OTP from storage
 * @returns Promise<boolean> - True if OTP matches, false otherwise
 */
export async function verifyOTP(plainOtp: string, hashedOtp: string): Promise<boolean> {
  return await bcrypt.compare(plainOtp, hashedOtp);
}

/**
 * Generate an OTP expiry timestamp (5 minutes from now)
 * @returns string - ISO timestamp for OTP expiry
 */
export function generateOTPExpiry(): string {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiryTime.toISOString();
}

/**
 * Check if an OTP has expired
 * @param expiryTimestamp - ISO timestamp of when the OTP expires
 * @returns boolean - True if expired, false if still valid
 */
export function isOTPExpired(expiryTimestamp: string): boolean {
  const now = new Date();
  const expiryTime = new Date(expiryTimestamp);
  return now > expiryTime;
}

/**
 * Validate OTP format (6 digits only)
 * @param otp - The OTP to validate
 * @returns boolean - True if valid format, false otherwise
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Generate a complete OTP record for storage
 * @returns Promise<{otp: string, hashedOtp: string, expiresAt: string}> - Complete OTP data
 */
export async function generateOTPRecord(): Promise<{
  otp: string;
  hashedOtp: string;
  expiresAt: string;
}> {
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = generateOTPExpiry();
  
  return {
    otp,
    hashedOtp,
    expiresAt
  };
}

/**
 * Clear OTP data (for security after successful verification)
 * @returns {otpSecret: null, otpExpiresAt: null} - Null values to clear OTP data
 */
export function clearOTPData(): { otpSecret: null; otpExpiresAt: null } {
  return {
    otpSecret: null,
    otpExpiresAt: null
  };
}