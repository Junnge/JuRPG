/**
 * Implements functionality of storing various game items.
 * @class
 */
export class Inventory {
	constructor() {
		this.stuff = {};
	}

	/**
	 *
	 * @param {import("../engine/types").ItemID} item ID of the item
	 * @param {number} count
	 */
	remove(item, count){
		if (this.stuff[item] > count){
			this.stuff[item] -= count;
		} else if (this.stuff[item] == count){
			delete this.stuff[item];
		} else {
			throw "Not enough items";
		}
	}

	/**
	 *
	 * @param {import("../engine/types").ItemID} item
	 * @param {number} count
	 */
	add(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}

	/**
	 *
	 * @param {import("../engine/types").ItemID} item
	 * @returns number
	 */
	has(item) {
		if (item in this.stuff) {
			return this.stuff[item]
		}
		return 0;
	}

	/**
	 *
	 * @param {import("../engine/types").ItemID} item
	 * @param {number} price
	 * @param {number} amount
	 */
	buy(item, price, amount){
		this.remove("cap", price*amount);
		this.add(item, amount);
	}

	/**
	 *
	 * @param {import("../engine/types").ItemID} item
	 * @param {number} price
	 * @param {number} amount
	 */
	sell(item, price, amount){
		this.remove(item, amount);
		this.add("cap", price*amount);
	}

	/**
	 * Saves inventory to localStorage
	 */
	save(){
		localStorage.inv = JSON.stringify(this.stuff);
	}

	/**
	 * Loads inventory from localStorage
	 */
	load(){
		this.stuff = JSON.parse(localStorage.inv);
	}
}