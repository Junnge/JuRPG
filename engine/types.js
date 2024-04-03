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
 * @typedef {Record<CraftID, CraftData>} CraftsContainer
 */

/**
 * Represents equipment slot of the item
 * @readonly
 * @enum {string}
 */
export var ITEM_SLOT = {
    BODY: "body",
    HEAD: "head",
    WEAPON: "weapon"
}

/**
 * @typedef {Object} SPECIAL
 * @property {number} strength
 * @property {number} perception : 1,
 * @property {number} endurance : 1,
 * @property {number} charisma : 1,
 * @property {number} intellegence : 1,
 * @property {number} agility : 1,
 * @property {number} luck : 1
 */

/**
 * @typedef {Object} ItemData
 * @property {string} name
 * @property {number} price
 * @property {number|undefined} armor
 * @property {ITEM_SLOT|undefined} slot
 * @property {string|undefined} description
 * @property {boolean} ranged
 * @property {number} effective_range
 * @property {number|undefined} damage
 * @property {boolean|undefined} pseudo_item
 */

/**
 * @typedef {Record<ItemID, ItemData>} ItemDataContainer
 */

/**
 * @typedef {Object} GameContent
 * @property {CraftsContainer} crafts
 * @property {ItemDataContainer} items
 * @property {Object} enemies
 * @property {Object} locations
 * @property {Object} activities
 * @property {Object} npcs
 * @property {Object} findings
 */


/**
 * @typedef {Object} GameState
 * @property {import('../classes/inventory').Inventory} inventory
 * @property {import('../classes/character-player').Player} player
 */