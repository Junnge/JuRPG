import { Item } from "./item.js";

/**
 * Represents agents of the game's world
 * @class
 */
export class Character {
	constructor(name, hp, max_hp, weapon, armor){
		this.name = name;
		this._hp = hp;
		this.hp_max = max_hp;
		this.slots = {weapon: weapon, body: armor, head: new Item("equip_item")};
		this.next_attack_is_crit = false;

		/**
		 * @type {import("../engine/types.js").SPECIAL}
		 */
		this.special = {
			strength : 1,
			perception : 1,
			endurance : 1,
			charisma : 1,
			intellegence : 1,
			agility : 1,
			luck : 1
		};
	}

	get hp() {
		return this._hp;
	}

	set hp(amount) {
		this._hp = amount;
		if (this._hp > this.hp_max) this.hp = this.hp_max;
		if (this._hp < 0) this.hp = 0;
	}

	get is_dead() {
		return this._hp == 0;
	}

	get_attack_damage(distance) {
		let item = this.slots.weapon
		if (item.is_ranged()) return this.slots.weapon.damage;
		if (this.special == undefined) return (this.slots.weapon.damage)
		return (this.slots.weapon.damage) * (1 + this.special.strength / 5)
	}

	get armor() {
		var armory = 0;
		for (var key in this.slots){
			var equipped_item = this.slots[key];
			if ("armor" in equipped_item) {
				armory += equipped_item.armor;
			}
		}
		return armory;
	}

	get_attack_range() {
		return this.slots.weapon.effective_range;
	}

	get_weapon_name() {
		return this.slots.weapon.name
	}

	get_accuracy() {
		return 0.7
	}

	get_crit_chance() {
		return 0.1
	}

	get_crit_mult() {
		return 3
	}
}