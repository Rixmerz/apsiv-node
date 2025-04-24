/**
 * Utility functions for handling slot IDs
 */

/**
 * Normalize slot ID to a consistent format (Bloque_X)
 * @param {string} slotId - The slot ID to normalize
 * @returns {string|null} - Normalized slot ID or null if invalid
 */
const normalizeSlotId = (slotId) => {
  // Normalize to format standard Bloque_X
  if (!slotId) return null;
  
  // If already in the correct format
  if (slotId.startsWith('Bloque_')) return slotId;
  
  // If in slot_X format, convert to Bloque_X
  if (slotId.startsWith('slot_')) {
    const number = slotId.replace('slot_', '');
    return `Bloque_${number}`;
  }
  
  // If it's a number, convert to Bloque_X
  if (!isNaN(slotId)) {
    return `Bloque_${slotId}`;
  }
  
  return slotId;
};

module.exports = {
  normalizeSlotId
};
