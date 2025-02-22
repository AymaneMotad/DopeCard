import * as uuid from 'uuid'; // Import the uuid library

export function generateUniqueReferralCode(length: number = 8): string {
  const generatedUuid = uuid.v4(); // Generate a UUID v4 (random)
  return generatedUuid.substring(0, length).toUpperCase();
}





