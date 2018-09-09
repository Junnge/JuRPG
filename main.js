var game_version = "1.06";



//ф-я для генерации цельных чисел в диапазоне [min, max]
function randomInt(min, max) { 
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

function loadJSON(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText, file);
		}
	}
	rawFile.send(null);
}

function jsoncallback(text, file){
	dataArrays[file] = JSON.parse(text);
}


function arrLoad(argument) {
	if (Object.keys(dataArrays).length != 6){
		console.log('loading');
		setTimeout(arrLoad, 50);
		return 0;
	}
	arrItems = dataArrays["data/items.json"];
	arrEnemies = dataArrays["data/enemies.json"];
	arrLocations = dataArrays["data/locations.json"];
	arrActivities = dataArrays["data/activities.json"];
	arrNpcs = dataArrays["data/npcs.json"];
	arrFindings = dataArrays["data/findings.json"];
	//enemyObject.change("emptyenemy");
	inv = new Inv();
	player = new Player('Путник', 'boy'); 
	current_fight = new Fight(player);
	if ("player" in localStorage) load_all();
	activity = new Activity('searching');
	//document.getElementById('activity_button').src='img/buttons/'+activity.type+'_button_unactive.png';
	status_update('Добро пожаловать в пустошь.'); 
	action_status();
	console.log('arrays loaded');
}



class Item {
	constructor(id){
		for (var key in arrItems[id]) {
			this[key] = arrItems[id][key]
		}
		this.id = id;
		this.range = 1; // для оружия. временно
	}
	
	toJSON(){
		return this.id
	}
}


class Char {
	constructor(name, hp, max_hp, weapon, armor){
		this.name = name;
		this._hp = hp;
		this.hp_max = max_hp;
		this.slots = {weapon: weapon, body: armor, head: new Item("equip_item")};
		this.next_attack_is_crit = false;
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

	get_attack_damage() {
		return this.slots.weapon.damage;
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
		return 9999
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

	spend_ammo(){
		return true;
	};
}

class Enemy extends Char {
	constructor(id){
		//console.log(id)
		//console.log(arrEnemies)
		var weapon_id = arrEnemies[id].weapon;
		if (weapon_id == undefined) weapon_id = "basicweapon";
		super(arrEnemies[id].name, 
			arrEnemies[id].hp, 
			arrEnemies[id].hp, 
			new Item(weapon_id), 
			new Item("basicarmor"));
		this.id = id;
		this.exp = arrEnemies[id].exp;
		this.loot = arrEnemies[id].loot;
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
	
	die() {
		player.give_exp(this.exp);
		var rand_caps_amount = randomInt(1, 10);
		var rand_loot = loot(this.loot);
		inv.add("cap", rand_caps_amount);
		inv.add(rand_loot, 1);
		status_update(`Вы убили ${H(this.name)} и получили ${this.exp} опыта, нашли ${rand_caps_amount} ${H('Крышка')} и ${H(arrItems[rand_loot].name)}`);
		status_update();  
	}

}
	
class Player extends Char {
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
		this.exp = this.exp + x;
		while (this.exp >= this.get_next_lvl_exp()) {
			this.lvlup();
		}
	}

	lvlup(){  
		this.base_damage++;
		this.skill_points++;
		this.exp = this.exp - this.get_next_lvl_exp();
		this.lvl++;
		this.set_hp_max();
		this.full_heal();
		status_update(`Теперь вы ${this.lvl} уровня`);
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
		} else if (activity.is_cd){
			show_box('action_box', 'action_button');
			status_update(arrActivities[activity.type].process);
		} else {
			this.location = id;
			//activity = new Activity(arrLocations[id]);
			show_box('action_box', 'action_button');
			status_update(`Вы добрались до ${H(arrLocations[id].name)}`);
			//document.getElementById('activity_button').src='img/buttons/'+activity.type+'_button_unactive.png';
		} 
	}
	
	equip(id){
		var item = new Item(id);
		if (item.slot in this.slots){
			this.slots[item.slot] = item;
			console.log(id, 'equipped');
		}
		inv.remove(id, 1);
	}
	
	unequip(slot_id){
		if (slot_id in this.slots){
			if (slot_id == 'weapon') {
				if (this.slots.weapon.id != "fists") {
					inv.add(this.slots.weapon.id, 1);
					this.slots.weapon = new Item("fists");
				}
			} else {
				var item_id = this.slots[slot_id].id;
				if (item_id != "equip_item") {
					inv.add(item_id, 1);
					this.slots[slot_id] = new Item("equip_item");
				}
			}
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
		return 0.08 + this.special.luck/100
	}

	get_stealth() {
		return this.special.perception/20 + this.special.luck/100
	}

	spend_ammo() {
		var ammo_id = this.slots.weapon.id + "_ammo";
		var the_weapon_uses_ammo = arrItems[ammo_id] != undefined;
		if (the_weapon_uses_ammo) {
			try {
				inv.remove(ammo_id, 1)
				return true;
			} catch (error) {
				if (error == "Not enough items") {
					status_update("У вас закончились патроны.")
					return false;
				}
			}
		}
		return true;
				
	}
}

function Inv() {
	this.stuff = {};
	
	this.remove = function(item, count){
		if (this.stuff[item] > count){
			this.stuff[item] -= count;
		} else if (this.stuff[item] == count){
			delete this.stuff[item];
		} else {
			throw "Not enough items";
		}
	}
	
	this.add = function(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}
	
	this.buy = function(item, price, amount){
		this.remove("cap", price*amount);
		this.add(item, amount);
	}

	this.sell = function(item, price, amount){
		this.remove(item, amount);
		this.add("cap", price*amount);
	}

	this.show = function(){
		document.getElementById('stuff_box').innerHTML = '';
		for (var item in this.stuff) {
			if (arrItems[item].slot != undefined){
				document.getElementById('stuff_box').innerHTML += `<br><a id="${item}" onclick="player.unequip('${arrItems[item].slot}'); player.equip('${item}')
				inv.show()" >${arrItems[item].name} (${this.stuff[item]})</a>`
			} else document.getElementById('stuff_box').innerHTML += `<br><a id="${item}" >${arrItems[item].name} (${this.stuff[item]})</a>`
			if (arrItems[item].heal != undefined && this.stuff[item] > 0){
				document.getElementById('stuff_box').innerHTML += `	 <img src="img/buttons/skill_increase_button.png" onclick="player.hp += (arrItems.${item}.heal); status_update(); inv.remove('${item}', 1); inv.show()">`;
			}
		}

		document.getElementById('equip_box').innerHTML = '';
		document.getElementById('equip_box').innerHTML += `<a onclick="player.unequip('weapon'); inv.show()">Руки: [${player.slots.weapon.name}]</a><br>`;
		document.getElementById('equip_box').innerHTML += `<a onclick="player.unequip('head'); inv.show()">Голова: [${player.slots.head.name}]</a><br>`;
		document.getElementById('equip_box').innerHTML += `<a onclick="player.unequip('body'); inv.show()">Тело: [${player.slots.body.name}]</a><br>`;
			//document.getElementById('inv_box').innerHTML += '<p>'+arrItems[item].name+" ("+this.stuff[item]+")</p>";
		
	}

	this.save = function(){
		localStorage.inv = JSON.stringify(this.stuff);
	}
	
	this.load = function(){
		this.stuff = JSON.parse(localStorage.inv);
	}
}


function Event(type, id){
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
		inv.add(id, 1);
	}
}
	
class EnemyEvent{
	constructor(id){
		this.type = "enemy";
		this.id = id;
	}
	process(){
		var enemy = new Enemy(this.id);
		status_update("Вы встретили " + H(enemy.name));
		if (stealth_roll()) {
			status_update("Вам удалось подкрасться незаметно. Следующий Ваш удар будет критическим.");
			player.next_attack_is_crit = true
		}
		current_fight.init();
		current_fight.add_fighter(player, 0);
		current_fight.add_fighter(enemy, 1);
		status_update();
		player.status = "in_combat";
	}
}
	
class FindingEvent{
	constructor(id){
		this.type = "finding";
		this.id = id;
	}
	process(){
		player.status = "idle";
		var finding = arrFindings[this.id]; 
		var item_id = loot(finding.loot);	
		status_update(`Вы обнаружили ${H(finding.name)}. Обыскав его, вы нашли ${H(arrItems[item_id].name)}`);
	}
}

class ActivityEvent{
	constructor(id){
		this.type = "activity";
		this.id = id;
		this.items = arrActivities[id].items;
		this.cd = 20000;
	}
	
	process() { 
		this.timestamp = performance.now();
		status_update(arrActivities[this.id].start + ` ${H(Math.floor(this.cd/1000)+' секунд')}`);
		var that = this;
		setTimeout(function(){that.finish()}, this.cd); 
		player.status = "busy";
		var timerId = setTimeout(function tick() {
			if (player.status == "busy"){
				action_status();
				timerId = setTimeout(tick, 1000);
			}
		}, 1000);
		action_status();
	}
	
	
	finish(){
		var loot = this.items[randomInt(0, this.items.length-1)];
		var got_xp = 1;
		inv.add(loot, 1);
		player.give_exp(got_xp);
		status_update(arrActivities[this.type].finish + `${H(arrItems[loot].name)} и получили ${got_xp} опыта.`);
		player.status = "idle";
		action_status();

	}
}



//Бой с монстром
function fight(){ 
	if (current_fight.started == 1) {
		current_fight.run();
	}
}
	
//Путешествие в пyстоши, генерация событий 
function adventure(){
	if (player.is_dead){
		status_update("Простите, но Вы мертвы");
		return;
	}
	var event_data = loot(arrLocations[player.location].events);
	var event = Event(event_data.type, event_data.id);
	event.process();
	action_status();
}

function stealth_roll(){
	dice = Math.random()
	return (player.get_stealth() > dice)
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
	
	this.add_fighter = function(fighter, team, coord = 'None'){
		console.log(coord)
		if (coord == 'None'){
			coord = this.distance * team
		}
		tmp = {fighter: fighter, team: team, coord: coord}
		this.fighters.push(tmp);
		if (fighter === this.player) {
			this.player_position = tmp
		}
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
		player.status = "idle";
		action_status();
	}
	
	this.get_target = function(i){
		tmp_distance = this.distance + 1;
		tmp = -1;
		for (var t = 0; t < this.fighters.length ; t++){
			j = this.fighters[t]
			if ((Math.abs(i.coord - j.coord) < tmp_distance) && (i.team != j.team) && (j.fighter.hp > 0)) {
				tmp_distance = Math.abs(i.coord - j.coord);
				tmp = j;
			}
		}
		return(tmp)
	}
	
	this.get_player_target_name = function() {
		tmp = this.get_target(this.player_position)
		if (tmp == -1){
			return('Нет врагов')
		} else {
			return(tmp.fighter.name)
		}
	}
	
	this.get_player_target_hp = function() {
		tmp = this.get_target(this.player_position)
		if (tmp == -1){
			return('0')
		} else {
			return(tmp.fighter.hp)		
		}
	}
	
	this.turn = function(){
		for (var k = 0; k < this.fighters.length ; k++){
			i = this.fighters[k]
			if (i.fighter.hp > 0) {
				tmp = this.get_target(i)
				tmp_distance = Math.abs(i.coord - tmp.coord)
				if (i.fighter.hp != 0 && tmp != -1) {
					if (i.fighter.get_attack_range() < tmp_distance) {
						this.move_forward(i);
					} else {
						this.attack(i.fighter, tmp.fighter);
					}
				
				}
			}
		}
	}
	
	this.attack = function(a, b, dist){
		var is_succesful = a.spend_ammo();
		if (!is_succesful) {
			return;
		}
		acc = a.get_accuracy();
		dice = Math.random();
		/*console.log('____________')
		console.log(acc)
		console.log(dice)
		console.log(a)*/
		if (acc < dice && !a.next_attack_is_crit) {
			status_update(`${H(a.name)} промахнулся`);
			return;
		}
		dice = Math.random();
		crit = a.get_crit_chance();
		if (crit > dice | a.next_attack_is_crit) {
			damage = Math.trunc(a.get_attack_damage(dist) * a.get_crit_mult() - b.armor)
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
			b.die();
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
	
	this.get_winner = function(){
		flag_0 = 1;
		flag_1 = 1;
		for (var k = 0; k < this.fighters.length ; k++){
			i = this.fighters[k]
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
			i = this.fighters[k]
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
		arr = localStorage.fight.split('^');
		this.fighters = [];
		if (arr[0] != "") {
			this.started = 1
			for (var k = 0; k < arr.length ; k++){
				i = arr[k]
				tmp_arr = i.split(' ');
				console.log(tmp_arr)
				if (tmp_arr[0] != '@player') {	
					tmp = Enemy.load_from_string(`${tmp_arr[0]} ${tmp_arr[1]}`);
					this.add_fighter(tmp, parseInt(tmp_arr[2]), parseInt(tmp_arr[3]));
				} else {
					this.add_fighter(this.player, parseInt(tmp_arr[2]), parseInt(tmp_arr[3]))
				}
			}
		}
		this.check_win()
		console.log(this)
	}
}


function load_all(){
	if(localStorage.version == game_version){
		player.load();
		//enemyObject.load();
		current_fight.load(player)
		inv.load();
		console.log('save loaded');
		status_update('Загружено сохранение!');
	} else {
		alert('Версия игры не совпадает, игра будет сброшена!');
		reset();
	}
}

function save_all(){
	localStorage.version = game_version;
	player.save();
	//enemyObject.save();
	current_fight.save()
	inv.save();
	console.log('games saved');
	status_update('Игра сохранена!');
}
function reset(){
	var remove = function(x){localStorage.removeItem(x)};
	["enemy", "player", "inv", "equip", "special", "fight"].forEach(remove);
	document.location.reload(true);
}

setInterval(save_all, 60000);

//Вывод text в лог сообщений, обновление всех показателей на панелях
function status_update(text) { 
	if (text!=undefined) {document.getElementById('action_box').innerHTML += "<p>" + text + "</p>";}	
	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+current_fight.get_player_target_hp();
	document.getElementById('health_bar_hero').innerHTML = "Здоровье: " + player.hp + "|" + player.hp_max;
	document.getElementById('enemy_name').innerHTML = "Имя: "+current_fight.get_player_target_name();
	document.getElementById('action_box').scrollTop = 999999;
}

function loot(lootlist){
	var weightsum = 0;
	for(var i = 0; i < lootlist.length; i++){
		weightsum += lootlist[i].rare;
	}
	rand = randomInt(1, weightsum);
	var i = 0;
	var tmp = 0;
	while(tmp < rand){
		tmp += lootlist[i].rare;
		i++;
		//console.log(tmp,' ', i);
	}
	return lootlist[i-1].item;
}

function cheats(){
	for (var item in arrItems) {
		inv.add(item, 100)
	};
	inv.add("cap", 1000000);
}

var activity;
var player;
var current_fight;
var arrEnemies;
var arrItems;
var arrLocations;
var arrActivities;
var arrNpcs;
var arrFindings;
var dataArrays = {};
console.log("json loading")
loadJSON("data/items.json", jsoncallback);
loadJSON("data/enemies.json", jsoncallback);
loadJSON("data/locations.json", jsoncallback);
loadJSON("data/activities.json", jsoncallback);
loadJSON("data/npcs.json", jsoncallback);
loadJSON("data/findings.json", jsoncallback);
arrLoad();
