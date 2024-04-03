import { gameContent } from "../engine/database.js";

export class Item {
	constructor(id){
		console.log("loading " + id)
		console.log(gameContent.items[id])
		for (var key in gameContent.items[id]) {
			this[key] = gameContent.items[id][key]
		}
		this.id = id;
	}

	toJSON(){
		return this.id
	}

	is_armor(){
		return ("armor" in this)
	}

	is_weapon(){
		return ("damage" in this)
	}

	is_ranged(){
		return (this["ranged"] == true)
	}

	is_equippable(){
		return ["weapon", "head", "body"].contains(this.slot)
	}

	ammo(){
		return gameContent.items[this.id + "_ammo"]
	}
}
