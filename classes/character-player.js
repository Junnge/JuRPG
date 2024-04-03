import { H } from "../engine/common.js";
import { gameContent } from "../engine/database.js";
import { action_log } from "../ui/status-update.js";
import { Char } from "./character.js";
import { Item } from "./item.js";

export class Player extends Char {
	constructor(name, sex){
		super(name, 100, 100, new Item("fists"), new Item("basicarmor"));
		this.lvl = 0;
		this.exp = 0;
		this.skill_points = 0;
		this.status = "idle";
		this.location = "rock";
		this.sex = sex;
		this.in_fight = 0;
		this.special_points = 10;
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
	//Ф-я начисления опыта и повышения уровня если достигнута нужная отметка
	give_exp(x){
		let modifier = 1 + this.special.intellegence / 10
		let add_exp = Math.floor(x * modifier)
		this.exp = this.exp + add_exp;
		while (this.exp >= this.get_next_lvl_exp()) {
			this.lvlup();
		}
		return add_exp
	}

	lvlup(){
		this.base_damage++;
		this.skill_points++;
		this.exp = this.exp - this.get_next_lvl_exp();
		this.lvl++;
		this.set_hp_max();
		this.full_heal();
		action_log(`Теперь вы ${this.lvl} уровня`);
	}

	set_hp_max(argument) {
		this.hp_max = 100 + this.special.endurance * 10 + this.lvl * 10;
	}

	full_heal(){
		this.hp = this.hp_max;
	}

	//Подсчет необходимиого кол-ва опыта для поднятия уровня
	get_next_lvl_exp(){
		return 10 * (this.lvl + 1);
	}

	travel(id){
		if (this.in_fight == 1) {
			show_box('action_box', 'action_button');
			status_update('Вы в бою!');
		// } else if (activity.is_cd){
		// 	show_box('action_box', 'action_button');
		// 	status_update(gameContent.activities[activity.type].process);
		} else {
			this.location = id;
			//activity = new Activity(gameContent.locations[id]);
			show_box('action_box', 'action_button');
			action_log(`Вы добрались до ${H(gameContent.locations[id].name)}`);
			//document.getElementById('activity_button').src='img/buttons/'+activity.type+'_button_unactive.png';
		}
	}

	save(){
		var arr = [this.name, this.lvl, this.exp, this.skill_points, this.base_damage, this.location, this.special_points, this.hp, this.hp_max, this.next_attack_is_crit, this.status];
		localStorage.player =  arr.join(' ');
		localStorage.special = JSON.stringify(this.special);
		//localStorage.equip = JSON.stringify(this.slots, (function(slot_name, item){return item.id}));
		localStorage.equip = JSON.stringify({weapon: this.slots.weapon.id, body: this.slots.body.id, head: this.slots.head.id});
	}

	load(){
		var data = localStorage.player.split(' ');
		this.name = data[0];
		this.lvl = Number(data[1]);
		this.exp = Number(data[2]);
		this.skill_points = Number(data[3]);
		this.base_damage = Number(data[4]);
		this.location = data[5];
		this.special_points = Number(data[6]);
		this.hp = Number(data[7]);
		this.hp_max = Number(data[8]);
		this.next_attack_is_crit = Boolean(data[9]);
		this.status = data[10];
		this.special = JSON.parse(localStorage.special);
		var s = JSON.parse(localStorage.equip);
		for (var key in s) {
			s[key] = new Item(s[key])
		};
		this.slots = s;
		//this.slots = JSON.parse(localStorage.equip, (function(slot_name, item_id){return new Item(item_id)}));
	}

	die() {
		status_update('Вы погибли.')
	}

	get_accuracy() {
		return (1 - 1/(this.special.agility + this.special.luck/5 + 2))
	}

	get_crit_chance() {
		return 0.1 + this.special.luck/100
	}

	get_stealth() {
		return 0.1 + this.special.perception/20 + this.special.luck/100
	}
}