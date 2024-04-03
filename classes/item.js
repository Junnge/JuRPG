import { gameContent } from "../engine/database.js";

/**
 * Implements functionality of various items used by characters
 * @class
 */
export class Item {
	/**
	 *
	 * @param {import("../engine/types.js").ItemID} id
	 */
	constructor(id){
		if (gameContent.items[id] == undefined) {
			alert("Item " + id + " is not defined in game's content files")
		}

		/**
		 * @type {import("../engine/types.js").ItemID}
		 */
		this.id = id;
	}

	/**
	 * Returns json compatible representation of item
	 * @returns {string}
	 */
	toJSON(){
		return this.id
	}

	/**
	 * Checks if item belongs to armour items
	 * @returns {boolean}
	 */
	is_armor(){
		return ("armor" in gameContent.items[this.id])
	}

	/**
	 *
	 * @returns {boolean}
	 */
	is_weapon(){
		return ("damage" in gameContent.items[this.id])
	}

	/**
	 *
	 * @returns {boolean}
	 */
	is_ranged(){
		return (gameContent.items[this.id].ranged == true)
	}

	/**
	 *
	 * @returns {boolean}
	 */
	is_equippable(){
		return (gameContent.items[this.id].slot != undefined)
	}

	/**
	 * Returns ID of ammunition used by this item
	 * @returns {import("../engine/types.js").ItemID}
	 */
	ammo(){
		return this.id + "_ammo"
	}
}
