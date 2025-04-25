/**
 * Utility functions for handling slot IDs
 */

/**
 * Normalize slot ID to a consistent format (block_X)
 * @param {string} slotId - The slot ID to normalize
 * @returns {string|null} - Normalized slot ID or null if invalid
 */
const normalizeSlotId = (slotId) => {
  // Normalize to format standard block_X
  if (!slotId) {
    console.warn('[Backend] normalizeSlotId: slotId is null or undefined');
    return null;
  }

  // Convert to string if it's not already
  const slotIdStr = String(slotId);

  // If already in the correct format
  if (slotIdStr.startsWith('block_')) {
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} already in backend format`);
    return slotIdStr;
  }

  // Handle legacy format (Bloque_X)
  if (slotIdStr.startsWith('Bloque_')) {
    const number = slotIdStr.replace('Bloque_', '');
    const result = `block_${number}`;
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} -> ${result} (legacy conversion)`);
    return result;
  }

  // If in slot_X format, convert to block_X
  if (slotIdStr.startsWith('slot_')) {
    const number = slotIdStr.replace('slot_', '');
    const result = `block_${number}`;
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  // If it's a number, convert to block_X
  if (!isNaN(slotIdStr)) {
    const result = `block_${slotIdStr}`;
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} (number) -> ${result}`);
    return result;
  }

  console.warn(`[Backend] normalizeSlotId: unknown format: ${slotIdStr}`);
  return slotIdStr;
};

/**
 * Convert backend slot ID to frontend format (slot_X)
 * @param {string} slotId - The slot ID to denormalize
 * @returns {string|null} - Denormalized slot ID or null if invalid
 */
const denormalizeSlotId = (slotId) => {
  if (!slotId) {
    console.warn('[Backend] denormalizeSlotId: slotId is null or undefined');
    return null;
  }

  // Convert to string if it's not already
  const slotIdStr = String(slotId);

  // If already in the frontend format
  if (slotIdStr.startsWith('slot_')) {
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} already in frontend format`);
    return slotIdStr;
  }

  // Handle new backend format (block_X)
  if (slotIdStr.startsWith('block_')) {
    const number = slotIdStr.replace('block_', '');
    const result = `slot_${number}`;
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  // Handle legacy format (Bloque_X)
  if (slotIdStr.startsWith('Bloque_')) {
    const number = slotIdStr.replace('Bloque_', '');
    const result = `slot_${number}`;
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} -> ${result} (legacy conversion)`);
    return result;
  }

  // If it's a number, convert to slot_X
  if (!isNaN(slotIdStr)) {
    const result = `slot_${slotIdStr}`;
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} (number) -> ${result}`);
    return result;
  }

  console.warn(`[Backend] denormalizeSlotId: unknown format: ${slotIdStr}`);
  return slotIdStr;
};

module.exports = {
  normalizeSlotId,
  denormalizeSlotId
};
