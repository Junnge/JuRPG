/**
 * @typedef {Object} ItemWithAmount
 * @property {string} id
 * @property {Number} amount
 */

/**
 * @typedef {Object} CraftData
 * @property {ItemWithAmount[]} inputs
 * @property {ItemWithAmount[]} outputs
 */

/**
 * @typedef {Object<string, CraftData>} CraftsContainer
 */

/**
 * @typedef {Object} GameContent
 * @property {CraftsContainer} crafts
 */