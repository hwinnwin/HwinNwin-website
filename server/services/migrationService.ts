import { storage } from '../storage';
import { hashPin, isPinHashed } from './pinService';

/**
 * Migration service to handle the transition from plaintext to hashed PIN storage
 */

/**
 * One-time migration to hash existing plaintext PINs
 * This function is safe to run multiple times - it only hashes plaintext PINs
 * @returns Promise<boolean> - True if migration was performed, false if no migration needed
 */
export async function migratePlaintextPinToHashed(): Promise<boolean> {
  try {
    const settings = await storage.getSettings();
    
    // Check if PIN is already hashed
    if (isPinHashed(settings.ownerPin)) {
      console.log('PIN is already hashed, no migration needed');
      return false;
    }
    
    // Hash the existing plaintext PIN  
    console.log('Migrating plaintext PIN to hashed storage...');
    const hashedPin = await hashPin(settings.ownerPin);
    
    // Update the PIN in storage, preserving isDefaultPin if it was a default PIN
    // This allows users to still do first-time PIN change after migration
    await storage.updateSettings({ 
      ownerPin: hashedPin
      // Note: deliberately NOT updating isDefaultPin here to preserve first-time change capability
    });
    
    console.log('PIN migration completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to migrate plaintext PIN:', error);
    throw error;
  }
}

/**
 * Utility to check if PIN migration is needed
 * @returns Promise<boolean> - True if migration is needed
 */
export async function isPinMigrationNeeded(): Promise<boolean> {
  try {
    const settings = await storage.getSettings();
    return !isPinHashed(settings.ownerPin);
  } catch (error) {
    console.error('Failed to check PIN migration status:', error);
    return false;
  }
}