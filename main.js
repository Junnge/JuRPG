var game_version = "1";

//ф-я для генерации цельных чисел в диапазоне [min, max]
function randomInt(min, max) { 
	var rand = min - 0.5 + Math.random() * (max - min + 1)
	rand = Math.round(rand);
	return rand;
}

function loadJSON(file, callback, dataarrayid) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText, dataarrayid);
        }
    }
    rawFile.send(null);
}

function jsoncallback(text, dataarrayid){
	dataArrays[dataarrayid] = JSON.parse(text);
}


var arrEnemies;
var arrItems;
var arrLocations;
var dataArrays = [0,0,0];
loadJSON("data/items.json", jsoncallback, 0);
loadJSON("data/enemies.json", jsoncallback, 1);
loadJSON("data/locations.json", jsoncallback, 2);


function arrLoad(argument) {
	if (dataArrays.some(function(x){return x==0})){
		console.log('loading');
		setTimeout(arrLoad, 10);
		return 0;
	}
	arrItems = dataArrays[0];
	arrEnemies = dataArrays[1];
	arrLocations = dataArrays[2]
	enemyObject.change("emptyenemy");
	if ("player" in localStorage) {
		load_all();
	} else {
		inv.add("gun10mm", 1);
	}
	status_update('Добро пожаловать в пустошь.'); 
	console.log('arrays loaded');
}
arrLoad();

// not to be called as functions but as methods
function heal(amount){
	this.hp += amount;
	if (this.hp > this.hp_max) this.hp = this.hp_max;
}
function reduce_hp(damage){
	this.hp -= damage;
	if (this.hp < 0) this.hp = 0;
}

function Enemy(){
	this.change = function(id){ 
		this.id = id;
		this.name = arrEnemies[id].name;
		this.hp = arrEnemies[id].hp;
		this.hp_max = this.hp;
		this.dmg = arrEnemies[id].dmg;
		this.exp = arrEnemies[id].exp;
		this.loot = arrEnemies[id].loot;
	}
	
	this.reduce_hp = reduce_hp;
	this.heal = heal;

	this.is_dead = function(){
		return this.hp == 0;
	}

	this.save = function(){
		localStorage.enemy = `${this.id} ${this.hp}`;
	}
	
	this.load = function(){
		var data = localStorage.enemy.split(' ');
		this.change(data[0]);
		this.hp = Number(data[1]);
	}

}

// объект для заполнения его активным монстром 
var enemyObject = new Enemy(); 

	
function Player(name){  
	this.name = name;
	this.lvl = 0;
	this.exp = 0;
	this.skill_points = 0;
	this.base_damage = 1;
	this.location = "ruins";
	this.hp = 100;
	this.hp_max = 100;
	
	this.special_points = 10;
	this.special = {
		strength : {
			name: "Сила",
			lvl : 1
		},
		perception : {
			name: "Наблюдательность",
			lvl : 1
		},
		endurance : {
			name: "Выносливость",
			lvl : 1
		},
		charisma : {
			name: "Харизма",
			lvl : 1
		},
		intellegence : {
			name: "Интеллект",
			lvl : 1
		},
		agility : {
			name: "Ловкость",
			lvl : 1
		},
		luck : {
			name: "Удача",
			lvl : 1
		}
	}
	this.reduce_hp = reduce_hp;
	this.heal = heal;
	
	//Ф-я начисления опыта и повышения уровня если достигнута нужная отметка
	this.give_exp = function(x){ 
		this.exp = this.exp + x;
		while (this.exp >= this.get_next_lvl_exp()) {
			this.lvlup();
		}
	}
	
	//Ф-я повышения уровня героя
	this.lvlup = function(){  
		this.base_damage++;
		this.skill_points++;
		this.exp = this.exp - this.get_next_lvl_exp();
		this.lvl++;
		this.hp_max += 10;
		this.full_heal();
		status_update(`Теперь вы ${this.lvl} уровня`);
	}
	
	this.full_heal = function(){
		this.hp = this.hp_max
	}
	
	//Подсчет необходимиого кол-ва опыта для поднятия уровня 
	this.get_next_lvl_exp = function(){ 
		return 10 * (this.lvl + 1);
	}
	this.travel = function(id){
		if(enemyObject.id == 'emptyenemy'){
			this.location = id;
			show_box('action_box', 'action_button');
			status_update(`Вы добрались до [${arrLocations[id].name}]`);
		} else {
			show_box('action_box', 'action_button');
			status_update('Вы в бою!');
		} 
	}

	this.show_stats = function() {
		document.getElementById('special_box').innerHTML = "";
		for (var spec in this.special) {
			document.getElementById('special_box').innerHTML += `<br><a>${this.special[spec].name}: ${this.special[spec].lvl}</a>`
			if (this.special_points > 0 && this.special[spec].lvl <10){
				document.getElementById('special_box').innerHTML += `  <img src="img/buttons/skill_increase_button.png" onclick="player.special['${spec}'].lvl++;player.special_points--; player.show_stats()">`;
			}
		}
		document.getElementById('special_box').innerHTML += `<br><p>Осталось очков SPECIAL: ${this.special_points}`;

		document.getElementById('info_box').innerHTML = "";
		document.getElementById('info_box').innerHTML += `<p>Уровень: ${this.lvl}`;
	}

	this.save = function(){
		var arr = [this.name, this.lvl, this.exp, this.skill_points, this.base_damage, this.location, this.special_points, this.hp, this.hp_max];
		localStorage.player =  arr.join(' ');
		localStorage.special = JSON.stringify(this.special);
		console.log(JSON.stringify(this.special));
	}
	
	this.load = function(){
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
		this.special = JSON.parse(localStorage.special);
	}

}

function Inv() {
	this.stuff = {};
	
	this.remove = function(item, count){
		if (this.stuff[item] >= count){
			this.stuff[item] -= count;
		} else {
		// you can't do this	
		}
	}
	
	this.add = function(item, count){
		if (item in this.stuff) {
			this.stuff[item] += count
		} else {
			this.stuff[item] = count
		}
	}

	this.show = function(){
		document.getElementById('inv_box').innerHTML = '';
		for (var item in this.stuff) {
			document.getElementById('inv_box').innerHTML += '<p>'+arrItems[item].name+" ("+this.stuff[item]+")</p>";
		}
	}

	this.save = function(){
		localStorage.inv = JSON.stringify(this.stuff);
	}
	
	this.load = function(){
		this.stuff = JSON.parse(localStorage.inv);
	}
}

//Создание игрока
var inv = new Inv();
var player = new Player('whoever'); 


//флаг кулдауна на действие 
var hunt_cd=0; 
//Охота на зверей
function hunt() { 
	if (hunt_cd==0){
		player.give_exp(1);
		status_update(`Вы поймали ${randomInt(2, 4)} ящерицы и получили 1XP`);
		hunt_cd = 1;
		//Активация кулдауна способности 
		setTimeout(function(){hunt_cd=0;}, 10000); 
	} else status_update("Вы устали!");
}

//Пуьешествие в постоши, генерация событий 
function adventure(){	
	if(enemyObject.id == 'emptyenemy'){
		var id = arrLocations[player.location].mob_ids[randomInt(0, arrLocations[player.location].mob_ids.length-1)];
		enemyObject.change(id);
		status_update(`Вы встретили [${enemyObject.name}]`);
	} else status_update(`Вы в бою!`);
}

//Бой с монстром
function fight(){ 
	if (!enemyObject.is_dead()){
		var damage = player.base_damage + randomInt(1, 6);
		enemyObject.reduce_hp(damage);
		if (enemyObject.is_dead()) {
			kill_current_enemy();
		} else {
			status_update(`Вы нанесли [${enemyObject.name}] ${damage} урона`);
		}
	}
}


//Смерть монстра, выдача опыта и сброс объкта
function kill_current_enemy(){ 
	player.give_exp(enemyObject.exp);
	var rand_caps_amount = randomInt(1, 10);
	var rand_loot = loot(enemyObject.loot);
	inv.add("cap", rand_caps_amount);
	inv.add(rand_loot, 1);
	status_update(`Вы убили [${enemyObject.name}] и получили ${enemyObject.exp} опыта, нашли ${rand_caps_amount} [Крышка] и [${arrItems[rand_loot].name}]`);
	enemyObject.change("emptyenemy");     
	status_update();  
}

function load_all(){
	if(localStorage.version == game_version){
		player.load();
		enemyObject.load();
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
	enemyObject.save();
	inv.save();
	console.log('games saved');
	status_update('Игра сохранена!');
}

function reset(){
	localStorage.removeItem("enemy");
	localStorage.removeItem("player");
	localStorage.removeItem("inv");
	localStorage.removeItem("special");
	document.location.reload(true);
}

setInterval(save_all, 60000);

//Вывод text в лог сообщений, обновление всех показателей на панелях
function status_update(text) { 
	if (text!=undefined) {document.getElementById('action_box').innerHTML += "<p>" + text + "</p>";}	
	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+enemyObject.hp;
	document.getElementById('health_bar_hero').innerHTML = "Здоровье: "+player.hp;
	document.getElementById('enemy_name').innerHTML = "Имя: "+enemyObject.name;
	document.getElementById('action_box').scrollTop = 9999;
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
	//console.log('dice=',rand,'loot=',lootlist[i-1]);
	return lootlist[i-1].item;

	/*var sums = [];
	for(var i = 0; i < list.length; i++){
		sums[i]=0;
		for (var j = 0; j <= i; j++) {
			sums[i]+=list[j].rare;
		}
	}
	for(var i = 0; i < sums.length; i++){
		if(sums[i]>=rand){
			console.log(list[i]);
			break;
		}
	}
	console.log(sums, rand);*/

}
