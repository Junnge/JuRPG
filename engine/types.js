/**
 * @typedef {string} ItemID
 */

/**
 * @typedef {string} CraftID
 */


/**
 * @typedef {Object} ItemWithAmount
 * @property {ItemID} id
 * @property {Number} amount
 */

/**
 * @typedef {Object} CraftData
 * @property {ItemWithAmount[]} inputs
 * @property {ItemWithAmount[]} outputs
 */

/**
 * @typedef {Object<ItemID, CraftData>} CraftsContainer
 */

/**
 * @typedef {Object} GameContent
 * @property {CraftsContainer} crafts
 */

/**
 * @typedef {Object} GameState
 * @property {import('../classes/inventory').Inventory} inventory
 */