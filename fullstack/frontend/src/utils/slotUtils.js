/**
 * Utility functions for handling slot IDs
 */

/**
 * Normalize slot ID to backend format (Bloque_X)
 * @param {string} slotId - The slot ID to normalize
 * @returns {string|null} - Normalized slot ID or null if invalid
 */
export const normalizeSlotId = (slotId) => {
  if (!slotId) return null;
  
  // Normalizar a formato Bloque_X para backend
  if (slotId.startsWith('Bloque_')) return slotId;
  
  if (slotId.startsWith('slot_')) {
    const number = slotId.replace('slot_', '');
    return `Bloque_${number}`;
  }
  
  if (!isNaN(slotId)) {
    return `Bloque_${slotId}`;
  }
  
  return slotId;
};

/**
 * Convert backend slot ID to frontend format (slot_X)
 * @param {string} slotId - The slot ID to denormalize
 * @returns {string|null} - Denormalized slot ID or null if invalid
 */
export const denormalizeSlotId = (slotId) => {
  if (!slotId) return null;
  
  if (slotId.startsWith('Bloque_')) {
    const number = slotId.replace('Bloque_', '');
    return `slot_${number}`;
  }
  
  return slotId;
};
