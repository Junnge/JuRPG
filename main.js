"use strict";

import { Item } from "./classes/item.js";
import { Player } from "./classes/character-player.js";
import { Inventory } from "./classes/inventory.js";
import { Enemy } from "./classes/character-enemy.js";
import { gameContent, arrLoad } from "./engine/database.js";
import { action_status } from "./communication.js";
import { _status_update } from "./ui/status-update.js";
import { H, randomInt } from "./engine/common.js";
import { spend_ammo } from "./systems/effects.js";
import { ITEM_SLOT } from "./engine/types.js";
import { Character } from "./classes/character.js";

var game_version = "1.07";

/**
 * @type {import("./engine/types.js").GameState}
 */
export var gameState = {
	current_event: undefined,
	player: undefined,
	inventory: undefined,
	current_fight: undefined
}

export function status_update(text) {
	_status_update(gameState.player, gameState.current_fight, text)
}

function send_update() {
	action_status(gameState, gameContent, fight, adventure)
}

function gameLoad(argument) {
	if (arrLoad() == 0) {
		setTimeout(gameLoad, 50);
		return;
	}

	gameState.inventory = new Inventory();
	gameState.player = new Player('Путник', 'boy');
	gameState.current_fight = new Fight(gameState.player);

	if ("player" in localStorage) load_all();

	if (gameState.player.status in gameContent.activities){
		gameState.current_event = new Event('activity', gameState.player.status);
	}

	//document.getElementById('activity_button').src='img/buttons/'+activity.type+'_button_unactive.png';
	status_update('Добро пожаловать в пустошь.');
	send_update() ;
	console.log('arrays loaded');
}

function Event(type, id){
	console.log("event id:" + id)
	switch (type) {
		case "item":
			return new ItemEvent(id);
		case "enemy":
			return new EnemyEvent(id);
		case "finding":
			return new FindingEvent(id);
		case "activity":
			return new ActivityEvent(id);
	}
}

class ItemEvent{
	constructor(id){
		this.type = "item";
		this.id = id;
	}
	process(){
		var item = new Item(this.id);
		status_update("Вы нашли " + H(item.name));
		gameState.inventory.add(id, 1);
	}
}

class EnemyEvent{
	constructor(id){
		this.type = "enemy";
		this.id = id;
		this.enemy = new Enemy(this.id);
	}
	go() {
		gameState.current_fight.init();
		let player_fighter = gameState.current_fight.add_fighter(gameState.player, gameState.inventory, 0);
		if (gameState.player.status == "stealth") {
			player_fighter.stealth = true;
		}

		gameState.current_fight.add_fighter(this.enemy, undefined, 1);
		status_update();
		gameState.player.status = "in_combat";
	}
	process(){
		status_update("Вы встретили " + H(this.enemy.name));
		if (stealth_roll(gameState.player)) {
			status_update("Вам удалось подкрасться незаметно. Следующий Ваш удар будет критическим.");
			gameState.player.next_attack_is_crit = true;
			gameState.player.status = "stealth";
			status_update();
		};
		this.go();
	}
}

class FindingEvent{
	constructor(id){
		this.type = "finding";
		this.id = id;
	}
	process(){
		gameState.player.status = "idle";
		var finding = gameContent.findings[this.id];
		var item_loot = loot(finding.loot);
		status_update(`Вы обнаружили ${H(finding.name)}. Обыскав его, вы нашли ${H(gameContent.items[item_loot.item].name)}`);
		gameState.inventory.add(item_loot.item, 1)
	}
}

class ActivityEvent{
	constructor(id){
		this.type = "activity";
		this.id = id;
		this.items = gameContent.activities[id].items;
		this.cd = 5000;
	}

	go() {
		this.timestamp = performance.now();

		console.log("!!!")
		console.log(this.id)
		console.log(gameContent.activities)

		status_update(gameContent.activities[this.id].start + ` ${H(Math.floor(this.cd/1000)+' секунд')}`);
		var that = this;

		setTimeout(
			function(){
				that.finish()
			}, this.cd
		);

		gameState.player.status = "busy";

		((activity) => {
			var timerId = setTimeout(
			function tick() {
				if (gameState.player.status == "busy") {
					activity.roll_loot();
					send_update();
					timerId = setTimeout(tick, 1000);
				}
			}, 1000
		)})(this);
		send_update() ;
	}

	process() {
		status_update(gameContent.activities[this.id].found)
		gameState.player.status = this.id;
		send_update() ;
	}

	roll_loot() {
		var loot_id = this.items[randomInt(0, this.items.length-1)];
		var xp = randomInt(0, 1);
		gameState.inventory.add(loot_id, 1);
		let got_exp = gameState.player.give_exp(xp);
		status_update(gameContent.activities[this.id].finish + `${H(gameContent.items[loot_id].name)} и получили ${got_exp} опыта.`);
	}

	finish(){
		gameState.player.status = "idle";
		send_update() ;
	}
}


//Бой с монстром
function fight(fight){
	if (fight.started == 1) {
		fight.run();
	}
}

//Путешествие в пyстоши, генерация событий
function adventure(player){
	if (player.is_dead){
		status_update("Вы мертвы. Нажмите RESET чтобы начать сначала.");
		return;
	}
	var event_data = loot(gameContent.locations[player.location].events);
	console.log("???")
	console.log(event_data)
	gameState.current_event = Event(event_data.type, event_data.item);
	gameState.current_event.process();
	send_update() ;
}

function stealth_roll(player){
	let dice = Math.random()
	return (player.get_stealth() > dice)
}

/**
 *
 * @param {Character} player
 * @param {Character} enemy
 * @returns
 */
function kill(player, enemy) {
	if (player != gameState.player) {
		return;
	}

	let got_exp = player.give_exp(enemy.exp);
	var rand_caps_amount = randomInt(1, 10);
	var rand_loot = loot(enemy.loot);
	gameState.inventory.add("cap", rand_caps_amount);
	gameState.inventory.add(rand_loot.item, 1);
	status_update(`Вы убили ${H(enemy.name)} и получили ${got_exp} опыта, нашли ${rand_caps_amount} ${H('Крышка')} и ${H(gameContent.items[rand_loot.item].name)}`);
	if (!enemy.slots.weapon.pseudo_item) {
		gameState.inventory.add(enemy.slots.weapon.id, 1)
		status_update(`Вы подобрали с трупа ${H(enemy.slots.weapon.name)}`);
	}
	status_update();
}

/**
 *
 * @param {Player} player
 * @param {Inventory} inventory
 * @param {import("./engine/types.js").ItemID} id
 */
export function equip(player, inventory, id){
	var item = new Item(id);
	if (item.slot == undefined) {
		return
	}
	player.slots[item.slot] = item;
	console.log(id, 'equipped');
	inventory.remove(id, 1);
}

/**
 *
 * @param {Player} player
 * @param {Inventory} inventory
 * @param {ITEM_SLOT} slot_id
 */
export function unequip(player, inventory, slot_id){
	if (slot_id in player.slots){
		if (slot_id == 'weapon') {
			if (player.slots.weapon.id != "fists") {
				inventory.add(player.slots.weapon.id, 1);
				player.slots.weapon = new Item("fists");
			}
		} else {
			var item_id = player.slots[slot_id].id;
			if (item_id != "equip_item") {
				inventory.add(item_id, 1);
				player.slots[slot_id] = new Item("equip_item");
			}
		}
	}

}

function Fight(player){
	this.player = player;
	this.started = 0;
	this.fighters = [];
	this.distance = 6;

	this.init = function(){
		this.distance = 6;
		this.fighters = [];
		this.started = 1;
		this.player.in_fight = 1;
	};

	this.add_fighter = function(fighter, inventory, team, coord = 'None'){
		console.log(coord)
		if (coord == 'None'){
			coord = this.distance * team
		}
		let tmp = {fighter: fighter, inventory: inventory, team: team, coord: coord}
		this.fighters.push(tmp);
		if (fighter === this.player) {
			this.player_position = tmp
		}

		return tmp
	};

	this.run = function(){
		if (this.get_winner() == 'None'){
			this.turn();
		}
		this.check_win()
	};

	this.check_win = function(){
		if (this.get_winner() == 'Player') {
			status_update('Вы победили в этом сражении.');
			this.stop()
		} else if (this.get_winner() == 'Enemy') {
			status_update('Спокойной ночи.');
			this.stop()
		}
	}

	this.stop = function(){
		this.started = 0
		this.player.in_fight = 0
		this.player.status = "idle";
		send_update() ;
	}

	this.get_target = function(i){
		let tmp_distance = this.distance + 1;
		let tmp = undefined;
		for (var t = 0; t < this.fighters.length ; t++){
			let j = this.fighters[t]

			if (
				(Math.abs(i.coord - j.coord) < tmp_distance)
				&& (i.team != j.team)
				&& (j.fighter.hp > 0)
				&& (j.stealth != true)
			) {
				tmp_distance = Math.abs(i.coord - j.coord);
				tmp = j;
			}
		}
		return(tmp)
	}

	this.get_player_target_name = function() {
		let tmp = this.get_target(this.player_position)
		if (tmp == undefined){
			return('Нет врагов')
		} else {
			return(tmp.fighter.name)
		}
	}

	this.get_player_target_hp = function() {
		let tmp = this.get_target(this.player_position)
		if (tmp == undefined){
			return('0')
		} else {
			return(tmp.fighter.hp)
		}
	}

	this.turn = function(){
		for (var k = 0; k < this.fighters.length ; k++){
			let i = this.fighters[k]
			if (i.fighter.hp > 0) {
				let tmp = this.get_target(i)
				if (tmp == undefined) {
					this.wait(i);
					continue;
				}

				let tmp_distance = Math.abs(i.coord - tmp.coord)
				if (i.fighter.hp != 0 && tmp != -1) {
					if (i.fighter.get_attack_range() < tmp_distance) {
						this.move_forward(i);
					} else {
						this.attack(i.fighter, i.inventory, tmp.fighter, tmp.inventory, tmp_distance);
						i.stealth = false;
					}
				}
			}
		}
	}

	/**
	 *
	 * @param {Character} a
	 * @param {Inventory|undefined} a_inventory
	 * @param {Character} b
	 * @param {Inventory|undefined} b_inventory
	 * @param {number} dist
	 * @returns
	 */
	this.attack = function(a, a_inventory, b, b_inventory, dist){

		var is_succesful = spend_ammo(a, a_inventory);

		status_update()
		if (!is_succesful) {
			console.log('no ammo')
			return;
		}

		let acc = a.get_accuracy();
		let dice = Math.random();
		/*console.log('____________')
		console.log(acc)
		console.log(dice)
		console.log(a)*/
		if (acc < dice && !a.next_attack_is_crit) {
			status_update(`${H(a.name)} промахнулся`);
			return;
		}
		dice = Math.random();
		let crit = a.get_crit_chance();
		console.log(dice)
		console.log(crit)
		console.log(a.next_attack_is_crit)

		let damage = 0;
		let base_attacker_damage = a.get_attack_damage(dist)

		console.log(base_attacker_damage)

		if (crit > dice || a.next_attack_is_crit) {

			console.log(a.get_crit_mult())

			base_attacker_damage = base_attacker_damage * a.get_crit_mult()

			damage = Math.trunc(base_attacker_damage - b.armor)
			a.next_attack_is_crit = false
		} else {
			damage = a.get_attack_damage(dist) - b.armor;
		}
		if (damage < 0) {
			damage = 0;
		}
		b.hp -= damage;
		status_update(`${H(a.name)} нанес ${H(b.name)} ${damage} урона с помощью ${H(a.get_weapon_name())}`);
		if (b.hp == 0) {
			kill(a, b);
		}
	}

	this.move_forward = function(a) {
		if (a.team == 0) {
			a.coord += 1
		}
		else {
			a.coord -= 1
		}
		status_update(`${H(a.fighter.name)} продвинулся вперёд`);
	}

	this.wait = function(a) {
		status_update(`${H(a.fighter.name)} ждёт`);
	}

	this.get_winner = function(){
		let flag_0 = 1;
		let flag_1 = 1;
		for (var k = 0; k < this.fighters.length ; k++){
			let i = this.fighters[k]
			if ((i.fighter.hp != 0) && (i.team == 0)){
				flag_0 = 0;
			}
			if ((i.fighter.hp != 0) && (i.team == 1)){
				flag_1 = 0;
			}
		}
		if ((flag_0 == 0) && (flag_1 == 0)){
			return('None');
		}
		if (flag_0 == 0){
			return('Player');
		}
		if (flag_1 == 0){
			return('Enemy');
		}
	}

	this.save = function() {
		var arr = [];
		for (var k = 0; k < this.fighters.length ; k++){
			let i = this.fighters[k]
			if (i.fighter instanceof Enemy) {
				arr.push(i.fighter.save_to_string() + ` ${i.team} ${i.coord}`);
			} else {
				arr.push(`@player 0 ${i.team} ${i.coord}`)
			}

		}
		console.log('fight array')
		console.log(arr)
		localStorage.fight = arr.join('^');
	}

	this.load = function(player) {
		this.player = player

		if (localStorage.fight == undefined) {
			localStorage.clear()
			document.location.reload(true);
		}

		var arr = localStorage.fight.split('^');
		this.fighters = [];
		if (arr[0] != "") {
			this.started = 1
			for (var k = 0; k < arr.length ; k++){
				let i = arr[k]
				let tmp_arr = i.split(' ');
				console.log(tmp_arr)
				if (tmp_arr[0] != '@player') {
					let tmp = Enemy.load_from_string(`${tmp_arr[0]} ${tmp_arr[1]}`);
					this.add_fighter(tmp, undefined, parseInt(tmp_arr[2]), parseInt(tmp_arr[3]));
				} else {
					this.add_fighter(this.player, gameState.inventory, parseInt(tmp_arr[2]), parseInt(tmp_arr[3]))
				}
			}
		}
		this.check_win()
		console.log(this)
	}
}


function load_all(){
	if(localStorage.version == game_version){
		gameState.player.load();
		//enemyObject.load();
		gameState.current_fight.load(gameState.player)
		gameState.inventory.load();
		console.log('save loaded');
		status_update('Загружено сохранение!');
	} else {
		alert('Версия игры не совпадает, игра будет сброшена!');
		reset();
	}
}

export function save_all(){
	localStorage.version = game_version;
	gameState.player.save();
	//enemyObject.save();
	gameState.current_fight.save()
	gameState.inventory.save();
	console.log('games saved');
	status_update('Игра сохранена!');
}
export function reset(){
	var remove = function(x){localStorage.removeItem(x)};
	["enemy", "player", "inv", "equip", "special", "fight"].forEach(remove);
	document.location.reload(true);
}

setInterval(save_all, 60000);



function loot(lootlist){
	var weightsum = 0;
	for(var i = 0; i < lootlist.length; i++){
		weightsum += lootlist[i].rare;
	}
	let rand = randomInt(1, weightsum);
	var i = 0;
	var tmp = 0;
	while(tmp < rand){
		tmp += lootlist[i].rare;
		i++;
		//console.log(tmp,' ', i);
	}
	return lootlist[i-1];
}

export function cheats(){
	for (var item in gameContent.items) {
		gameState.inventory.add(item, 100)
	};
	gameState.inventory.add("cap", 999900);
	status_update("Вы получили по 100 штук каждой вещи в игре и немного крышек");
}

gameLoad()
