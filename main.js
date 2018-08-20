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
	console.log(arrItems);
	console.log(arrEnemies);
	console.log(arrLocations);
}
arrLoad();



function Enemy(){
	this.change = function(id){ 
		this.name = arrEnemies[id].name;
		this.hp = arrEnemies[id].hp;
		this.dmg = arrEnemies[id].dmg;
		this.exp = arrEnemies[id].exp;
		this.loot = arrEnemies[id].loot;
	}
	
	this.reduce_hp = function(damage){
		this.hp -= damage;
		if (this.hp <= 0) this.hp = 0;
	}
	this.is_dead = function(){
		return this.hp == 0;
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
	inv.add("gun10mm", 1)

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
		this.lvl = this.lvl + 1;
		status_update(`Теперь вы ${this.lvl} уровня`);
	}
	
	//Подсчет необходимиого кол-ва опыта для поднятия уровня 
	this.get_next_lvl_exp = function(){ 
		return 10 * (this.lvl + 1);
	}
	this.travel = function(id){
		this.location = id;
		show_box('text_box', 'text_button');
		status_update(`Вы добрались до [${arrLocations[id].name}]`);
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
		document.getElementById('status_box').innerHTML = '';
		for (var item in this.stuff) {
			document.getElementById('status_box').innerHTML += '<p>'+arrItems[item].name+" ("+this.stuff[item]+")</p>";
		}
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
	var id = arrLocations[player.location].mob_ids[randomInt(0, arrLocations[player.location].mob_ids.length-1)];
	enemyObject.change(id);
	status_update(`Вы встретили [${enemyObject.name}]`);
}

//Бой с монстром
function fight(){ 
	if (!(enemyObject.is_dead())){
		var damage = player.base_damage + randomInt(1, 6);
		enemyObject.reduce_hp(damage)
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

//Вывод text в лог сообщений, обновление всех показателей на панелях
function status_update(text) { 
	if (text!=undefined) {document.getElementById('text_box').innerHTML += "<p>" + text + "</p>";}	
	document.getElementById('exp_bar').innerHTML = "Опыт: " + player.exp + " | " + player.get_next_lvl_exp();
	document.getElementById('health_bar_enemy').innerHTML = "Здоровье: "+enemyObject.hp;
	document.getElementById('enemy_name').innerHTML = "Имя: "+enemyObject.name;
	document.getElementById('text_box').scrollTop = 9999;
}


//Отображение элементов интерфейса 
function show_box(box, button) {
document.getElementById('text_button').src = "img/buttons/button_unactive.png";
document.getElementById('map_button').src = "img/buttons/button_unactive.png";
document.getElementById('status_button').src = "img/buttons/button_unactive.png";
document.getElementById('text_box').style = "visibility: hidden;"
document.getElementById('map_box').style = "visibility: hidden;"
document.getElementById('status_box').style = "visibility: hidden;"
document.getElementById('action_buttons').style = "visibility: hidden;"
document.getElementById(box).style = "visibility: visible;"
document.getElementById(button).src = "img/buttons/button_active.png";

	if (box == 'text_box') {document.getElementById('action_buttons').style = "visibility: visible;"}
}

//Очень страшная ф-я для обработки колесика мышки
var elem = document.getElementById('text_box');
if (elem.addEventListener) {
	if ('onwheel' in document) {
		// IE9+, FF17+, Ch31+
		elem.addEventListener("wheel", onWheel);
	} else if ('onmousewheel' in document) {
		// устаревший вариант события
		elem.addEventListener("mousewheel", onWheel);
	} else {
		// Firefox < 17
		elem.addEventListener("MozMousePixelScroll", onWheel);
	}
	} else { // IE8-
		elem.attachEvent("onmousewheel", onWheel);
	}

function onWheel(e) {
	e = e || window.event;
	var delta = e.deltaY || e.detail || e.wheelDelta;
	var info = document.getElementById('text_box');
	document.getElementById('text_box').scrollTop += delta*3;
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
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
	console.log('dice=',rand,'loot=',lootlist[i-1]);
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
