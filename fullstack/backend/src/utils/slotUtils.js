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
  if (!slotId) {
    console.warn('[Backend] normalizeSlotId: slotId is null or undefined');
    return null;
  }

  // Convertir a string si no lo es
  const slotIdStr = String(slotId);

  // If already in the correct format
  if (slotIdStr.startsWith('Bloque_')) {
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} ya está en formato backend`);
    return slotIdStr;
  }

  // If in slot_X format, convert to Bloque_X
  if (slotIdStr.startsWith('slot_')) {
    const number = slotIdStr.replace('slot_', '');
    const result = `Bloque_${number}`;
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  // If it's a number, convert to Bloque_X
  if (!isNaN(slotIdStr)) {
    const result = `Bloque_${slotIdStr}`;
    console.log(`[Backend] normalizeSlotId: ${slotIdStr} (número) -> ${result}`);
    return result;
  }

  console.warn(`[Backend] normalizeSlotId: formato desconocido: ${slotIdStr}`);
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

  // Convertir a string si no lo es
  const slotIdStr = String(slotId);

  if (slotIdStr.startsWith('slot_')) {
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} ya está en formato frontend`);
    return slotIdStr;
  }

  if (slotIdStr.startsWith('Bloque_')) {
    const number = slotIdStr.replace('Bloque_', '');
    const result = `slot_${number}`;
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  if (!isNaN(slotIdStr)) {
    const result = `slot_${slotIdStr}`;
    console.log(`[Backend] denormalizeSlotId: ${slotIdStr} (número) -> ${result}`);
    return result;
  }

  console.warn(`[Backend] denormalizeSlotId: formato desconocido: ${slotIdStr}`);
  return slotIdStr;
};

module.exports = {
  normalizeSlotId,
  denormalizeSlotId
};
