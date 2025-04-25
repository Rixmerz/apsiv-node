/**
 * Utility functions for handling slot IDs
 */

/**
 * Normalize slot ID to backend format (Bloque_X)
 * @param {string} slotId - The slot ID to normalize
 * @returns {string|null} - Normalized slot ID or null if invalid
 */
export const normalizeSlotId = (slotId) => {
  if (!slotId) {
    console.warn('normalizeSlotId: slotId is null or undefined');
    return null;
  }

  // Convertir a string si no lo es
  const slotIdStr = String(slotId);

  // Normalizar a formato Bloque_X para backend
  if (slotIdStr.startsWith('Bloque_')) {
    console.log(`normalizeSlotId: ${slotIdStr} ya está en formato backend`);
    return slotIdStr;
  }

  if (slotIdStr.startsWith('slot_')) {
    const number = slotIdStr.replace('slot_', '');
    const result = `Bloque_${number}`;
    console.log(`normalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  if (!isNaN(slotIdStr)) {
    const result = `Bloque_${slotIdStr}`;
    console.log(`normalizeSlotId: ${slotIdStr} (número) -> ${result}`);
    return result;
  }

  console.warn(`normalizeSlotId: formato desconocido: ${slotIdStr}`);
  return slotIdStr;
};

/**
 * Convert backend slot ID to frontend format (slot_X)
 * @param {string} slotId - The slot ID to denormalize
 * @returns {string|null} - Denormalized slot ID or null if invalid
 */
export const denormalizeSlotId = (slotId) => {
  if (!slotId) {
    console.warn('denormalizeSlotId: slotId is null or undefined');
    return null;
  }

  // Convertir a string si no lo es
  const slotIdStr = String(slotId);

  if (slotIdStr.startsWith('slot_')) {
    console.log(`denormalizeSlotId: ${slotIdStr} ya está en formato frontend`);
    return slotIdStr;
  }

  if (slotIdStr.startsWith('Bloque_')) {
    const number = slotIdStr.replace('Bloque_', '');
    const result = `slot_${number}`;
    console.log(`denormalizeSlotId: ${slotIdStr} -> ${result}`);
    return result;
  }

  if (!isNaN(slotIdStr)) {
    const result = `slot_${slotIdStr}`;
    console.log(`denormalizeSlotId: ${slotIdStr} (número) -> ${result}`);
    return result;
  }

  console.warn(`denormalizeSlotId: formato desconocido: ${slotIdStr}`);
  return slotIdStr;
};
