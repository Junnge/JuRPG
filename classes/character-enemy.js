import { gameContent } from "../engine/database.js";
import { Char } from "./character.js";
import { Item } from "./item.js";

export class Enemy extends Char {
	constructor(id){
		//console.log(id)
		//console.log(gameContent.enemies)
		var weapon_id = gameContent.enemies[id].weapon;
		if (weapon_id == undefined) weapon_id = "basicweapon";
		super(gameContent.enemies[id].name,
			gameContent.enemies[id].hp,
			gameContent.enemies[id].hp,
			new Item(weapon_id),
			new Item("basic_armor_1"));
		this.id = id;
		this.exp = gameContent.enemies[id].exp;
		this.loot = gameContent.enemies[id].loot;
	}


	save(){
		localStorage.enemy = `${this.id} ${this.hp}`;
	}

	save_to_string(){
		return `${this.id} ${this.hp}`
	}

	static load_from_string(s) {
		var data = s.split(' ');
		var enemy = new this(data[0]);
		enemy.hp = Number(data[1]);
		return enemy;
	}
}